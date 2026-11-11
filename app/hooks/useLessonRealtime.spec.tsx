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

import { useLessonRealtime } from '~/hooks/useLessonRealtime';
import { env } from '~/lib/env';
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

const renderLive = (enabled = true) => {
  const client = new QueryClient();
  const invalidate = vi
    .spyOn(client, 'invalidateQueries')
    .mockResolvedValue(undefined);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const view = renderHook(() => useLessonRealtime(lesson, enabled), {
    wrapper,
  });
  const reloaded = () =>
    invalidate.mock.calls.map(([filters]) => filters?.queryKey);

  return { ...view, reloaded };
};

const open = async (result: { current: { status: string } }) => {
  await waitFor(() => {
    expect(result.current.status).toBe('open');
  });
};

describe('useLessonRealtime', () => {
  it('should reload the list when a question changes', async () => {
    const { result, reloaded } = renderLive();
    await open(result);

    sockets[0]?.send(JSON.stringify({ type: 'questions', lessonId: 'l1' }));

    await waitFor(() => {
      expect(reloaded()).toEqual([['questions', 'c1', 'l1', { limit: 10 }]]);
    });
    expect(ticket).toHaveBeenCalledWith(lesson);
  });

  it("should reload a question's answers and the list's count", async () => {
    const { result, reloaded } = renderLive();
    await open(result);

    sockets[0]?.send(
      JSON.stringify({ type: 'answers', lessonId: 'l1', questionId: 'q1' }),
    );

    await waitFor(() => {
      expect(reloaded()).toEqual([
        ['questions', 'c1', 'l1', 'q1', 'answers', { limit: 20 }],
        ['questions', 'c1', 'l1', { limit: 10 }],
      ]);
    });
  });

  it("should ignore another lesson's change", async () => {
    const { result, reloaded } = renderLive();
    await open(result);

    sockets[0]?.send(JSON.stringify({ type: 'questions', lessonId: 'l2' }));
    sockets[0]?.send(JSON.stringify({ type: 'questions', lessonId: 'l1' }));

    await waitFor(() => {
      expect(reloaded()).toHaveLength(1);
    });
  });

  it('should reload the whole lesson after coming back, not on the first open', async () => {
    const { result, reloaded } = renderLive();
    await open(result);
    expect(reloaded()).toEqual([]);

    sockets[0]?.close(1001);

    await waitFor(() => {
      expect(reloaded()).toEqual([['questions', 'c1', 'l1']]);
    });
  });

  it('should not connect when it is off', () => {
    const { result } = renderLive(false);

    expect(result.current.status).toBe('idle');
    expect(ticket).not.toHaveBeenCalled();
  });
});
