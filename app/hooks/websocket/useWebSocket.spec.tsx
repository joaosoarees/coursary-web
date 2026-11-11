import type { AddressInfo } from 'node:net';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type WebSocket as ServerSocket, WebSocketServer } from 'ws';
import { z } from 'zod';

import {
  useWebSocket,
  type UseWebSocketOptions,
} from '~/hooks/websocket/useWebSocket';

const schema = z.object({ type: z.literal('questions') });

interface Server {
  url: string;
  paths: string[];
  sockets: ServerSocket[];
  received: string[];
  close: () => Promise<void>;
}

let server: Server | undefined;

// A local ws server on a free port, standing in for API Gateway.
const startServer = async ({
  refuse = false,
}: { refuse?: boolean } = {}): Promise<Server> => {
  const paths: string[] = [];
  const sockets: ServerSocket[] = [];
  const received: string[] = [];
  const wss = new WebSocketServer({
    port: 0,
    verifyClient: (info, done) => {
      paths.push(info.req.url ?? '');
      done(!refuse, 403);
    },
  });
  wss.on('connection', (socket) => {
    sockets.push(socket);
    socket.on('message', (data: Buffer) => received.push(data.toString()));
  });
  await new Promise<void>((resolve) => wss.once('listening', resolve));
  const { port } = wss.address() as AddressInfo;

  server = {
    url: `ws://127.0.0.1:${String(port)}/`,
    paths,
    sockets,
    received,
    close: () =>
      new Promise<void>((resolve) => {
        for (const socket of wss.clients) {
          socket.terminate();
        }
        wss.close(() => {
          resolve();
        });
      }),
  };

  return server;
};

afterEach(async () => {
  await server?.close();
  server = undefined;
});

const tickets = () => {
  let issued = 0;

  return vi.fn(() => {
    issued += 1;

    return Promise.resolve(`ticket-${String(issued)}`);
  });
};

const render = (
  options: Partial<UseWebSocketOptions<{ type: 'questions' }>>,
) => {
  const getTicket = tickets();

  return renderHook(() =>
    useWebSocket({
      url: null,
      getTicket,
      schema,
      onMessage: () => undefined,
      baseDelayMs: 5,
      maxDelayMs: 10,
      ...options,
    }),
  );
};

describe('useWebSocket', () => {
  it('should open with a ticket and hand over only valid messages', async () => {
    const { url, sockets } = await startServer();
    const onMessage = vi.fn();
    const { result } = render({ url, onMessage });

    await waitFor(() => {
      expect(result.current.status).toBe('open');
    });
    expect(server?.paths).toEqual(['/?ticket=ticket-1']);

    sockets[0]?.send('not json');
    sockets[0]?.send(JSON.stringify({ type: 'other' }));
    sockets[0]?.send(JSON.stringify({ type: 'questions' }));

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledExactlyOnceWith({ type: 'questions' });
    });
  });

  it('should come back after a drop with a new ticket, telling each open', async () => {
    const { url, sockets, paths } = await startServer();
    const onOpen = vi.fn();
    const { result } = render({ url, onOpen });

    await waitFor(() => {
      expect(result.current.status).toBe('open');
    });
    sockets[0]?.close(1001);

    await waitFor(() => {
      expect(onOpen).toHaveBeenCalledTimes(2);
    });
    expect(paths).toEqual(['/?ticket=ticket-1', '/?ticket=ticket-2']);
  });

  it('should give up after the quick failures in a row, and come back online', async () => {
    const { url, paths } = await startServer({ refuse: true });
    const { result } = render({ url, maxAttempts: 2 });

    await waitFor(() => {
      expect(result.current.status).toBe('closed');
    });
    expect(paths).toHaveLength(3);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(paths).toHaveLength(6);
    });
  });

  it('should stay out after a close that says so', async () => {
    const { url, sockets, paths } = await startServer();
    const { result } = render({ url });

    await waitFor(() => {
      expect(result.current.status).toBe('open');
    });
    sockets[0]?.close(4001);

    await waitFor(() => {
      expect(result.current.status).toBe('closed');
    });
    expect(paths).toHaveLength(1);
  });

  it('should send the keep-alive only after a silence', async () => {
    const { url, received } = await startServer();
    const { result } = render({ url, keepAliveMs: 100 });

    await waitFor(() => {
      expect(result.current.status).toBe('open');
    });

    await waitFor(() => {
      expect(received).toContain('{"action":"ping"}');
    });
  });

  it('should close the connection on unmount and not come back', async () => {
    const { url, sockets, paths } = await startServer();
    const { result, unmount } = render({ url });

    await waitFor(() => {
      expect(result.current.status).toBe('open');
    });
    unmount();

    await waitFor(() => {
      expect(sockets[0]?.readyState).toBe(sockets[0]?.CLOSED);
    });
    expect(paths).toHaveLength(1);
  });

  it('should stay idle without an address', () => {
    const getTicket = vi.fn(() => Promise.resolve('t'));
    const { result } = render({ url: null, getTicket });

    expect(result.current.status).toBe('idle');
    expect(getTicket).not.toHaveBeenCalled();
  });
});
