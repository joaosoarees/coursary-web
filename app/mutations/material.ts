import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { lessonQuery } from '~/queries/lesson';
import type { Attachment, LessonContent } from '~/services/LessonService';
import { MaterialService } from '~/services/MaterialService';

const useMaterialWriter = (courseId: string, lessonId: string) => {
  const queryClient = useQueryClient();
  const key = lessonQuery(courseId, lessonId).queryKey;

  return {
    queryClient,
    key,
    write: (change: (files: Attachment[]) => Attachment[]) => {
      queryClient.setQueryData<LessonContent>(key, (content) =>
        content
          ? { ...content, attachments: change(content.attachments) }
          : content,
      );
    },
  };
};

export const useDeleteMaterial = (courseId: string, lessonId: string) => {
  const { write } = useMaterialWriter(courseId, lessonId);

  return useMutation({
    mutationFn: (fileId: string) =>
      MaterialService.delete(courseId, lessonId, fileId),
    onSuccess: (_, fileId) => {
      write((files) => files.filter((file) => file.id !== fileId));
    },
  });
};

// Reordering has a way back: the new order shows at once and is undone if the API refuses it.
export const useReorderMaterial = (courseId: string, lessonId: string) => {
  const { queryClient, key, write } = useMaterialWriter(courseId, lessonId);

  return useMutation({
    scope: { id: `material-order-${lessonId}` },
    mutationFn: (files: Attachment[]) =>
      MaterialService.reorder(
        courseId,
        lessonId,
        files.map((file) => file.id),
      ),
    onMutate: async (files) => {
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData<LessonContent>(key);
      write(() => files);

      return { before };
    },
    onError: (_error, _files, context) => {
      if (context?.before) {
        queryClient.setQueryData(key, context.before);
      }

      toast.error('Não deu para salvar a nova ordem. Ela voltou ao que era.', {
        id: 'material-order-failed',
      });
    },
  });
};
