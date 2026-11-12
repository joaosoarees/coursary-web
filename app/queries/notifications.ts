import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { NotificationService } from '~/services/NotificationService';

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const notificationsKey = ['notifications'] as const;

export const notificationsQuery = infiniteQueryOptions({
  queryKey: [...notificationsKey, { limit: NOTIFICATIONS_PAGE_SIZE }],
  queryFn: ({ pageParam, signal }) =>
    NotificationService.list(
      { cursor: pageParam, limit: NOTIFICATIONS_PAGE_SIZE },
      signal,
    ),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  staleTime: 30_000,
});

export const useNotifications = (enabled = true) =>
  useInfiniteQuery({ ...notificationsQuery, enabled });
