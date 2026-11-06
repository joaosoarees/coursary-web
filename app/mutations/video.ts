import { useMutation, useQueryClient } from '@tanstack/react-query';

import { lessonQuery } from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import type { LessonContent } from '~/services/LessonService';
import { VideoService } from '~/services/VideoService';

export const useDeleteVideo = (courseId: string, lessonId: string) => {
  const queryClient = useQueryClient();
  const key = lessonQuery(courseId, lessonId).queryKey;

  return useMutation({
    mutationFn: async () => {
      try {
        await VideoService.delete({ courseId, lessonId });
      } catch (error) {
        // Removed already, from another tab: what the person wanted is done.
        if (ApiFailure.codeOf(error) !== 'VIDEO_NOT_FOUND') {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<LessonContent>(key, (content) =>
        content ? { ...content, video: undefined } : content,
      );
    },
  });
};
