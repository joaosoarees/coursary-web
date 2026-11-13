import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { NotificationService } from '~/services/NotificationService';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown, status = 200) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

// As NotificationSummary of the API sends them: an archived course has no lesson or actor.
const reply = {
  id: 'n1',
  kind: 'answer',
  courseId: 'c1',
  courseTitle: 'Python',
  lessonId: 'l1',
  lessonTitle: 'Filtrando',
  questionId: 'q1',
  actorName: 'Marina',
  byInstructor: true,
  read: false,
  createdAt: '2026-11-12T12:00:00.000Z',
};
const archived = {
  id: 'n2',
  kind: 'archived',
  courseId: 'c2',
  courseTitle: 'SQL',
  byInstructor: false,
  read: true,
  createdAt: '2026-11-10T12:00:00.000Z',
};

const lastCall = () => adapter.mock.calls.at(-1)?.[0];

describe('NotificationService', () => {
  it('should read a page of the inbox with the unread count', async () => {
    const page = {
      items: [reply, archived],
      nextCursor: 'next',
      unreadCount: 1,
    };
    answer(page);

    await expect(
      NotificationService.list({ cursor: 'abc', limit: 20 }),
    ).resolves.toEqual(page);
    expect(lastCall()).toMatchObject({
      method: 'get',
      url: '/me/notifications',
      params: { cursor: 'abc', limit: 20 },
    });
  });

  it('should refuse a kind it does not know', async () => {
    answer({
      items: [{ ...reply, kind: 'promo' }],
      nextCursor: null,
      unreadCount: 0,
    });

    await expect(
      NotificationService.list({ cursor: undefined, limit: 20 }),
    ).rejects.toThrow();
  });

  it('should mark one notification read', async () => {
    answer(undefined, 204);

    await NotificationService.markRead('n/1');

    expect(lastCall()).toMatchObject({
      method: 'post',
      url: '/me/notifications/n%2F1/read',
    });
  });

  it('should mark all read and say how many', async () => {
    answer({ marked: 3 });

    await expect(NotificationService.markAllRead()).resolves.toBe(3);
    expect(lastCall()).toMatchObject({
      method: 'post',
      url: '/me/notifications/read-all',
    });
  });
});
