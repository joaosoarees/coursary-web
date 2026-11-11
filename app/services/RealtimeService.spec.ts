import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { RealtimeService } from '~/services/RealtimeService';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown, status = 201) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

describe('RealtimeService', () => {
  it('should ask for a ticket to the lesson', async () => {
    answer({ ticket: 'abc', expiresAt: '2026-11-11T12:00:30.000Z' });

    await expect(
      RealtimeService.ticket({ courseId: 'c1', lessonId: 'l1' }),
    ).resolves.toBe('abc');
    expect(adapter.mock.calls.at(-1)?.[0]).toMatchObject({
      method: 'post',
      url: '/realtime/tickets',
      data: JSON.stringify({ courseId: 'c1', lessonId: 'l1' }),
    });
  });

  it('should refuse an answer without a ticket', async () => {
    answer({ expiresAt: '2026-11-11T12:00:30.000Z' });

    await expect(
      RealtimeService.ticket({ courseId: 'c1', lessonId: 'l1' }),
    ).rejects.toThrow();
  });
});
