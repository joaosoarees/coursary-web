import {
  keepPreviousData,
  noop,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { type StudentOrder, StudentService } from '~/services/StudentService';

export const STUDENTS_PAGE_SIZE = 20;

export const courseStudentsQuery = (
  courseId: string,
  { cursor, order }: { cursor: string | undefined; order: StudentOrder },
) =>
  queryOptions({
    queryKey: [
      'courses',
      'teaching',
      'course',
      courseId,
      'students',
      { order, cursor, limit: STUDENTS_PAGE_SIZE },
    ],
    queryFn: ({ signal }) =>
      StudentService.list(
        courseId,
        { cursor, order, limit: STUDENTS_PAGE_SIZE },
        signal,
      ),
    staleTime: 30_000,
  });

export function useCourseStudents(
  courseId: string,
  page: { cursor: string | undefined; order: StudentOrder },
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...courseStudentsQuery(courseId, page),
    placeholderData: keepPreviousData,
  });
  const nextCursor = query.isPlaceholderData
    ? undefined
    : (query.data?.nextCursor ?? undefined);

  useEffect(() => {
    if (nextCursor) {
      queryClient
        .query(
          courseStudentsQuery(courseId, {
            cursor: nextCursor,
            order: page.order,
          }),
        )
        .catch(noop);
    }
  }, [queryClient, courseId, nextCursor, page.order]);

  return query;
}
