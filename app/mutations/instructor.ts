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

// A refusal for the course's status means it changed elsewhere (another tab): show what it is now.
const refreshIfStale = (queryClient: QueryClient, courseId: string) => () =>
  void queryClient.invalidateQueries({
    queryKey: managedCourseQuery(courseId).queryKey,
  });

export const usePublishCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => InstructorService.publish(courseId),
    onError: refreshIfStale(queryClient, courseId),
    onSuccess: (course) => {
      storeManagedCourse(queryClient, course);
    },
  });
};

export const useArchiveCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => InstructorService.archive(courseId),
    onError: refreshIfStale(queryClient, courseId),
    onSuccess: (course) => {
      storeManagedCourse(queryClient, course);
    },
  });
};

export const useDeleteDraft = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => InstructorService.deleteDraft(courseId),
    onError: refreshIfStale(queryClient, courseId),
    onSuccess: () => {
      // Not removed: the edit page still observes it until it navigates away, and would refetch it.
      void queryClient.invalidateQueries({
        queryKey: managedCourseQuery(courseId).queryKey,
        refetchType: 'none',
      });
      queryClient.setQueryData(myCoursesQuery.queryKey, (list) =>
        list
          ? {
              ...list,
              pages: list.pages.map((page) => ({
                ...page,
                items: page.items.filter((course) => course.id !== courseId),
              })),
            }
          : list,
      );
    },
  });
};
