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
      const { queryKey } = enrollmentQuery(courseId);

      // Writing every second watched would render the lesson again for nothing on screen: only a
      // new last lesson is written, and the rest is read again the next time it is shown.
      if (queryClient.getQueryData(queryKey)?.lastLessonId !== lessonId) {
        queryClient.setQueryData(
          queryKey,
          (progress) =>
            progress && {
              ...progress,
              lastLessonId: lessonId,
              positionSeconds,
            },
        );
      }
      void queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
      EnrollmentService.savePosition(
        { courseId, lessonId, positionSeconds },
        { leaving },
      ).catch(noop);
    },
    [queryClient, courseId, lessonId],
  );
};
