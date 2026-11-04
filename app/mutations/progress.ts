import { noop, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

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

// A position that fails to save is simply sent again with the next one.
export const useSavePosition = (courseId: string, lessonId: string) => {
  const queryClient = useQueryClient();

  return useCallback(
    (positionSeconds: number, leaving = false) => {
      queryClient.setQueryData(
        enrollmentQuery(courseId).queryKey,
        (progress) =>
          progress && { ...progress, lastLessonId: lessonId, positionSeconds },
      );
      EnrollmentService.savePosition(
        { courseId, lessonId, positionSeconds },
        { leaving },
      ).catch(noop);
    },
    [queryClient, courseId, lessonId],
  );
};
