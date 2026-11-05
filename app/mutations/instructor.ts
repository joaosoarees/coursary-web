import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { managedCourseQuery, myCoursesQuery } from '~/queries/instructor';
import {
  type CourseInfo,
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';

// The catalog, the search and the course page show the title too; they refetch when next shown.
// Marked before the write, so the course just saved is not marked with them.
export const storeManagedCourse = (
  queryClient: QueryClient,
  course: ManagedCourse,
) => {
  void queryClient.invalidateQueries({
    queryKey: ['courses'],
    refetchType: 'none',
  });
  void queryClient.invalidateQueries({ queryKey: myCoursesQuery.queryKey });
  queryClient.setQueryData(managedCourseQuery(course.id).queryKey, course);
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: CourseInfo) => InstructorService.create(info),
    onSuccess: (course) => {
      storeManagedCourse(queryClient, course);
    },
  });
};

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: CourseInfo) => InstructorService.update(courseId, info),
    onSuccess: (course) => {
      storeManagedCourse(queryClient, course);
    },
  });
};
