import { useMutation, useQueryClient } from '@tanstack/react-query';

import { enrollmentQuery } from '~/queries/course';
import { EnrollmentService } from '~/services/EnrollmentService';

// A completion cannot be undone, so the screen waits for the server instead of guessing.
export const useCompleteLesson = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) =>
      EnrollmentService.completeLesson({ courseId, lessonId }),
    onSuccess: ({ lessonId, completedLessons }) => {
      queryClient.setQueryData(
        enrollmentQuery(courseId).queryKey,
        (progress) =>
          progress && !progress.completedLessonIds.includes(lessonId)
            ? {
                ...progress,
                completedLessons,
                completedLessonIds: [...progress.completedLessonIds, lessonId],
              }
            : progress,
      );
      // My enrollments shows the count too; it refetches when next shown.
      void queryClient.invalidateQueries({
        queryKey: ['courses', 'enrolled'],
        refetchType: 'none',
      });
    },
  });
};
