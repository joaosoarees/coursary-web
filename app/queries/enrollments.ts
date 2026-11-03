import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { EnrollmentService } from '~/services/EnrollmentService';

const ENROLLMENTS_PAGE_SIZE = 12;

// Under 'courses', so enrolling or cancelling marks this list stale with the other course lists.
export const myEnrollmentsQuery = infiniteQueryOptions({
  queryKey: ['courses', 'enrolled', { limit: ENROLLMENTS_PAGE_SIZE }],
  queryFn: ({ pageParam, signal }) =>
    EnrollmentService.listMine(
      { cursor: pageParam, limit: ENROLLMENTS_PAGE_SIZE },
      signal,
    ),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  staleTime: 30_000,
});

export const useMyEnrollments = () => useInfiniteQuery(myEnrollmentsQuery);
