import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { CatalogService, type SearchInput } from '~/services/CatalogService';

const CATALOG_PAGE_SIZE = 12;

export const catalogQuery = infiniteQueryOptions({
  queryKey: ['courses', 'catalog', { limit: CATALOG_PAGE_SIZE }],
  queryFn: ({ pageParam, signal }) =>
    CatalogService.list(
      { cursor: pageParam, limit: CATALOG_PAGE_SIZE },
      signal,
    ),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

export const SEARCH_PAGE_SIZE = 12;

export const searchQuery = ({ query, page }: Omit<SearchInput, 'perPage'>) =>
  queryOptions({
    queryKey: ['courses', 'search', { query, page, perPage: SEARCH_PAGE_SIZE }],
    queryFn: ({ signal }) =>
      CatalogService.search({ query, page, perPage: SEARCH_PAGE_SIZE }, signal),
    staleTime: 30_000,
  });

export const useCatalog = () => useInfiniteQuery(catalogQuery);

export const useSearch = (input: Omit<SearchInput, 'perPage'>) =>
  useQuery({ ...searchQuery(input), placeholderData: keepPreviousData });
