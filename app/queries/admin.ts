import {
  infiniteQueryOptions,
  noop,
  queryOptions,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { type AccountsFilter, AdminService } from '~/services/AdminService';

export const ACCOUNTS_PAGE_SIZE = 20;

export const accountsQuery = (
  filter: AccountsFilter,
  cursor: string | undefined,
) =>
  queryOptions({
    queryKey: [
      'admin',
      'accounts',
      { ...filter, cursor, limit: ACCOUNTS_PAGE_SIZE },
    ] as const,
    queryFn: ({ signal }) =>
      AdminService.list(
        { ...filter, cursor, limit: ACCOUNTS_PAGE_SIZE },
        signal,
      ),
    staleTime: 30_000,
  });

export function useAccounts(
  filter: AccountsFilter,
  cursor: string | undefined,
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...accountsQuery(filter, cursor),
    // Only another page of the same filter bridges the wait: another filter's rows would be wrong.
    placeholderData: (previous, previousQuery) => {
      const key = previousQuery?.queryKey[2];

      return key?.role === filter.role && key.status === filter.status
        ? previous
        : undefined;
    },
  });
  const nextCursor = query.isPlaceholderData
    ? undefined
    : (query.data?.nextCursor ?? undefined);
  const { role, status } = filter;

  useEffect(() => {
    if (nextCursor) {
      queryClient
        .query(accountsQuery({ role, status }, nextCursor))
        .catch(noop);
    }
  }, [queryClient, role, status, nextCursor]);

  return query;
}

export const accountByEmailQuery = (email: string) =>
  queryOptions({
    queryKey: ['admin', 'accounts', 'by-email', email],
    queryFn: ({ signal }) => AdminService.findByEmail(email, signal),
    staleTime: 30_000,
  });

export function useAccountByEmail(email: string | undefined) {
  return useQuery({
    ...accountByEmailQuery(email ?? ''),
    enabled: email !== undefined,
  });
}

const ROLE_CHANGES_PAGE_SIZE = 20;

export const roleChangesQuery = (accountId: string) =>
  infiniteQueryOptions({
    queryKey: ['admin', 'accounts', accountId, 'role-changes'],
    queryFn: ({ pageParam, signal }) =>
      AdminService.roleChanges(
        accountId,
        { cursor: pageParam, limit: ROLE_CHANGES_PAGE_SIZE },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });

export const useRoleChanges = (accountId: string) =>
  useInfiniteQuery(roleChangesQuery(accountId));
