import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { CourseService } from '~/services/CourseService';
import { EnrollmentService } from '~/services/EnrollmentService';

const REVIEWS_PAGE_SIZE = 10;

const FRESH_FOR = 30_000;

export const courseQuery = (courseId: string) =>
  queryOptions({
    queryKey: ['courses', courseId],
    queryFn: ({ signal }) => CourseService.get(courseId, signal),
    staleTime: FRESH_FOR,
  });

export const reviewsQuery = (courseId: string) =>
  infiniteQueryOptions({
    queryKey: ['courses', courseId, 'reviews', { limit: REVIEWS_PAGE_SIZE }],
    queryFn: ({ pageParam, signal }) =>
      CourseService.listReviews(
        { courseId, cursor: pageParam, limit: REVIEWS_PAGE_SIZE },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: FRESH_FOR,
  });

export const enrollmentQuery = (courseId: string) =>
  queryOptions({
    queryKey: ['courses', courseId, 'enrollment'],
    queryFn: ({ signal }) => EnrollmentService.progress(courseId, signal),
    staleTime: FRESH_FOR,
  });

export const useCourse = (courseId: string) => useQuery(courseQuery(courseId));

export const useReviews = (courseId: string) =>
  useInfiniteQuery(reviewsQuery(courseId));

export const useEnrollment = (courseId: string) =>
  useQuery(enrollmentQuery(courseId));
