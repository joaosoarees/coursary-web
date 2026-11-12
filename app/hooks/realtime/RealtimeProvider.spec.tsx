import type { AddressInfo } from 'node:net';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { type WebSocket as ServerSocket, WebSocketServer } from 'ws';

import { useWatchLesson } from '~/hooks/realtime/RealtimeContext';
import { RealtimeProvider } from '~/hooks/realtime/RealtimeProvider';
import { env } from '~/lib/env';
import type { LessonRef } from '~/services/QuestionService';
import { RealtimeService } from '~/services/RealtimeService';

vi.mock('~/lib/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/env')>();

  return { env: { ...actual.env } };
});

const lesson = { courseId: 'c1', lessonId: 'l1' };

let wss: WebSocketServer;
let sockets: ServerSocket[];
let ticket: MockInstance<typeof RealtimeService.ticket>;

beforeEach(async () => {
  sockets = [];
  wss = new WebSocketServer({ port: 0 });
  wss.on('connection', (socket) => sockets.push(socket));
  await new Promise<void>((resolve) => wss.once('listening', resolve));
  env.VITE_WS_URL = `ws://127.0.0.1:${String((wss.address() as AddressInfo).port)}/`;
  ticket = vi.spyOn(RealtimeService, 'ticket').mockResolvedValue('ticket-1');
});

afterEach(async () => {
  for (const socket of wss.clients) {
    socket.terminate();
  }
  await new Promise<void>((resolve) => {
    wss.close(() => {
      resolve();
    });
  });
});

const renderTab = ({
  enabled = true,
  watching = null,
}: { enabled?: boolean; watching?: LessonRef | null } = {}) => {
  const client = new QueryClient();
  const invalidate = vi
    .spyOn(client, 'invalidateQueries')
    .mockResolvedValue(undefined);
  const onChange = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RealtimeProvider enabled={enabled}>{children}</RealtimeProvider>
    </QueryClientProvider>
  );
  const view = renderHook(
    ({ current }: { current: LessonRef | null }) => {
      useWatchLesson(current, onChange, () => undefined);
    },
    { wrapper, initialProps: { current: watching } },
  );
  const reloaded = () =>
    invalidate.mock.calls.map(([filters]) => filters?.queryKey);

  return { ...view, reloaded, onChange };
};

const connections = async (count: number) => {
  await waitFor(() => {
    expect(sockets).toHaveLength(count);
  });
};

// The server sees the connection before the client sees it open: a notice answered proves both
// ends are open, and the first open reloads nothing.
const opened = async (reloaded: () => unknown[]) => {
  await connections(1);
  sockets[0]?.send(JSON.stringify({ type: 'notifications' }));
  await waitFor(() => {
    expect(reloaded()).toEqual([['notifications']]);
  });
};

describe('RealtimeProvider', () => {
  it('should open one connection for the account and reload the inbox on a notice', async () => {
    const { reloaded } = renderTab();
    await connections(1);

    sockets[0]?.send(JSON.stringify({ type: 'notifications' }));

    await waitFor(() => {
      expect(reloaded()).toEqual([['notifications']]);
    });
    expect(ticket).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('should reload the inbox after coming back, not on the first open', async () => {
    const { reloaded } = renderTab();
    await opened(reloaded);

    sockets[0]?.close(1001);

    await waitFor(() => {
      expect(reloaded()).toHaveLength(2);
    });
  });

  it('should reconnect with the lesson when one is watched, and without it after', async () => {
    const { rerender, onChange, reloaded } = renderTab();
    await opened(reloaded);

    rerender({ current: lesson });
    await connections(2);
    // Notices posted while the connection changed lesson were never pushed to this tab.
    await waitFor(() => {
      expect(reloaded()).toHaveLength(2);
    });
    sockets[1]?.send(JSON.stringify({ type: 'questions', lessonId: 'l1' }));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        type: 'questions',
        lessonId: 'l1',
      });
    });

    rerender({ current: null });
    await connections(3);

    expect(ticket.mock.calls).toEqual([[undefined], [lesson], [undefined]]);
  });

  it('should stay off while signed out', () => {
    renderTab({ enabled: false });

    expect(ticket).not.toHaveBeenCalled();
  });
});
