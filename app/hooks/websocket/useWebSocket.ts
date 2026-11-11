import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import type { z } from 'zod';

import { Backoff } from '~/hooks/websocket/Backoff';

export type WebSocketStatus =
  'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface UseWebSocketOptions<T> {
  // null keeps the hook idle.
  url: string | null;
  // Asked before every attempt: a ticket opens one connection only.
  getTicket: () => Promise<string>;
  schema: z.ZodType<T>;
  onMessage: (message: T) => void;
  // Every open, the first one and each reconnection.
  onOpen?: () => void;
  // Quick failures in a row before giving up with 'closed'.
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  // Only a connection that stays open this long resets the failure count.
  stableAfterMs?: number;
  // The browser's WebSocket has no connect timeout of its own.
  connectTimeoutMs?: number;
  // API Gateway closes a connection after 10 minutes without a frame.
  keepAliveMs?: number;
}

const KEEP_ALIVE = '{"action":"ping"}';

// 1008 (policy) and 4000-4999 (the application's own codes) mean "do not come back".
const isFinalClose = (code: number) =>
  code === 1008 || (code >= 4000 && code <= 4999);

export function useWebSocket<T>({
  url,
  getTicket,
  schema,
  onMessage,
  onOpen,
  maxAttempts = 5,
  baseDelayMs = 1_000,
  maxDelayMs = 30_000,
  stableAfterMs = 30_000,
  connectTimeoutMs = 10_000,
  keepAliveMs = 5 * 60_000,
}: UseWebSocketOptions<T>) {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const [generation, setGeneration] = useState(0);
  const lastActivity = useRef(0);

  // Effect Events see the latest props without being dependencies: a new callback on every
  // render does not reconnect.
  const handleData = useEffectEvent((data: unknown) => {
    if (typeof data !== 'string') {
      return;
    }

    let json: unknown;

    try {
      json = JSON.parse(data);
    } catch {
      return;
    }

    const result = schema.safeParse(json);

    if (result.success) {
      onMessage(result.data);
    }
  });
  const fetchTicket = useEffectEvent(() => getTicket());
  const notifyOpen = useEffectEvent(() => onOpen?.());

  useEffect(() => {
    if (!url) {
      return;
    }

    const target = url;
    let socket: WebSocket | null = null;
    let failures = 0;
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let connectTimer: ReturnType<typeof setTimeout> | undefined;
    let stableTimer: ReturnType<typeof setTimeout> | undefined;
    let keepAliveTimer: ReturnType<typeof setInterval> | undefined;

    const clearTimers = () => {
      clearTimeout(retryTimer);
      clearTimeout(connectTimer);
      clearTimeout(stableTimer);
      clearInterval(keepAliveTimer);
    };

    const handleMessage = (event: MessageEvent<unknown>) => {
      lastActivity.current = Date.now();
      handleData(event.data);
    };

    const handleOpen = () => {
      clearTimeout(connectTimer);
      stableTimer = setTimeout(() => {
        failures = 0;
      }, stableAfterMs);
      lastActivity.current = Date.now();
      // Checked five times per interval: the longest silence is 1.2 times keepAliveMs.
      keepAliveTimer = setInterval(() => {
        const silent = Date.now() - lastActivity.current >= keepAliveMs;

        if (silent && socket?.readyState === WebSocket.OPEN) {
          socket.send(KEEP_ALIVE);
          lastActivity.current = Date.now();
        }
      }, keepAliveMs / 5);
      setStatus('open');
      notifyOpen();
    };

    const detach = () => {
      socket?.removeEventListener('message', handleMessage);
      socket?.removeEventListener('open', handleOpen);
      socket?.removeEventListener('close', handleClose);
    };

    // 'error' carries nothing and is always followed by 'close'. A refused handshake reaches the
    // browser as 1006 like a dropped network, so it counts as one more quick failure.
    function handleClose(event: CloseEvent) {
      clearTimers();
      detach();

      if (isFinalClose(event.code)) {
        setStatus('closed');

        return;
      }

      scheduleRetry();
    }

    function scheduleRetry() {
      if (disposed) {
        return;
      }

      if (failures >= maxAttempts) {
        setStatus('closed');

        return;
      }

      setStatus('reconnecting');
      retryTimer = setTimeout(
        () => void connect(),
        Backoff.delay(failures, { baseDelayMs, maxDelayMs }),
      );
      failures += 1;
    }

    async function connect() {
      let ticket: string;

      try {
        ticket = await fetchTicket();
      } catch {
        scheduleRetry();

        return;
      }

      // Under Strict Mode the first run is disposed before the ticket arrives: one handshake.
      if (disposed) {
        return;
      }

      const address = new URL(target);
      address.searchParams.set('ticket', ticket);
      const current = new WebSocket(address);
      socket = current;
      current.addEventListener('message', handleMessage);
      current.addEventListener('open', handleOpen);
      current.addEventListener('close', handleClose);
      connectTimer = setTimeout(() => {
        current.close();
      }, connectTimeoutMs);
    }

    void connect();

    return () => {
      disposed = true;
      clearTimers();
      detach();
      socket?.close();
    };
  }, [
    url,
    generation,
    maxAttempts,
    baseDelayMs,
    maxDelayMs,
    stableAfterMs,
    connectTimeoutMs,
    keepAliveMs,
  ]);

  const reconnect = useCallback(() => {
    setStatus('connecting');
    setGeneration((value) => value + 1);
  }, []);

  const current = url === null ? 'idle' : status;
  const comeBack = useEffectEvent(() => {
    if (current === 'closed' && navigator.onLine) {
      reconnect();
    }
  });

  // A connection given up on comes back with the network or with the tab.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        comeBack();
      }
    };

    window.addEventListener('online', comeBack);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('online', comeBack);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { status: current, reconnect };
}
