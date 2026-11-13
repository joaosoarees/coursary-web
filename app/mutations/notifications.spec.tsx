import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '~/mutations/notifications';
import { notificationsQuery } from '~/queries/notifications';
import { questionsQuery } from '~/queries/questions';
import { NotificationService } from '~/services/NotificationService';
import { apiError } from '~/test/renderRoutes';

const lesson = { courseId: 'c1', lessonId: 'l1' };
const emptyPages = { pages: [], pageParams: [] };

let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(notificationsQuery.queryKey, emptyPages);
  client.setQueryData(questionsQuery(lesson).queryKey, emptyPages);
});

const render = <T,>(hook: () => T) =>
  renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

const stale = (queryKey: readonly unknown[]) =>
  client.getQueryState(queryKey)?.isInvalidated;

describe('notification mutations', () => {
  it('should reload the inbox after marking one read, and nothing else', async () => {
    const markRead = vi
      .spyOn(NotificationService, 'markRead')
      .mockResolvedValue(undefined);
    const { result } = render(() => useMarkNotificationRead());

    act(() => {
      result.current.mutate('n1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(markRead).toHaveBeenCalledWith('n1');
    expect(stale(notificationsQuery.queryKey)).toBe(true);
    expect(stale(questionsQuery(lesson).queryKey)).toBe(false);
  });

  it('should reload the inbox after marking all read', async () => {
    vi.spyOn(NotificationService, 'markAllRead').mockResolvedValue(3);
    const { result } = render(() => useMarkAllNotificationsRead());

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(stale(notificationsQuery.queryKey)).toBe(true);
  });

  it('should leave the inbox as it was when the mark is refused', async () => {
    vi.spyOn(NotificationService, 'markRead').mockRejectedValue(
      apiError(404, 'NOTIFICATION_NOT_FOUND'),
    );
    const { result } = render(() => useMarkNotificationRead());

    act(() => {
      result.current.mutate('n1');
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(stale(notificationsQuery.queryKey)).toBe(false);
  });
});
