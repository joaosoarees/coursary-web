import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { InstructorService } from '~/services/InstructorService';

const MY_COURSES_PAGE_SIZE = 12;

// Under 'courses', so creating, editing or removing a course marks this list stale with the others.
export const myCoursesQuery = infiniteQueryOptions({
  queryKey: ['courses', 'teaching', { limit: MY_COURSES_PAGE_SIZE }],
  queryFn: ({ pageParam, signal }) =>
    InstructorService.listMine(
      { cursor: pageParam, limit: MY_COURSES_PAGE_SIZE },
      signal,
    ),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  staleTime: 30_000,
});

export const useMyCourses = () => useInfiniteQuery(myCoursesQuery);

export const managedCourseQuery = (courseId: string) =>
  queryOptions({
    queryKey: ['courses', 'teaching', 'course', courseId],
    queryFn: ({ signal }) => InstructorService.get(courseId, signal),
    staleTime: 30_000,
  });

export const useManagedCourse = (courseId: string) =>
  useQuery(managedCourseQuery(courseId));
