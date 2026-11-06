import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useFileUpload } from '~/hooks/useFileUpload';
import {
  checkMaterial,
  MATERIAL_FULL,
} from '~/instructor/lesson/materialRules';
import { lessonQuery } from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import { type LessonContent, LessonService } from '~/services/LessonService';
import { MaterialService } from '~/services/MaterialService';

// A file counts as ready when the lesson lists it: the API has no status route for material.
export function useMaterialUpload(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const key = lessonQuery(courseId, lessonId).queryKey;

  const upload = useFileUpload({
    check: checkMaterial,
    request: (type, file) => {
      setName(file.name);

      return MaterialService.requestUpload(courseId, lessonId, {
        contentType: type,
        fileName: file.name,
      });
    },
    requestProblem: (error) =>
      ApiFailure.message(error, {
        ATTACHMENT_LIMIT: MATERIAL_FULL,
        COURSE_ARCHIVED: 'O curso foi arquivado e não pode mais ser editado.',
      }),
    readStatus: async (fileId) => {
      const content = await LessonService.open({ courseId, lessonId });
      const listed = content.attachments.some((file) => file.id === fileId);

      // Only the new file is taken from the answer: the order on screen may be a move still in
      // flight, and the rest of the answer (a newly signed video address) would reload the player.
      if (listed) {
        queryClient.setQueryData<LessonContent>(key, (current) => {
          if (!current) {
            return content;
          }

          const known = new Set(current.attachments.map((file) => file.id));

          return {
            ...current,
            attachments: [
              ...current.attachments,
              ...content.attachments.filter((file) => !known.has(file.id)),
            ],
          };
        });
      }

      return listed ? 'PROCESSED' : 'PENDING';
    },
    refresh: () => Promise.resolve(),
    messages: {
      ready: 'Arquivo enviado.',
      refused:
        'O arquivo foi recusado. Confira o tipo e o tamanho e envie de novo.',
      notReady:
        'O arquivo ainda está sendo confirmado e deve aparecer sozinho. Recarregue a página antes de enviar de novo.',
      unconfirmed:
        'Não deu para confirmar o envio. Se o arquivo não aparecer em instantes, envie de novo.',
    },
  });

  return { ...upload, name };
}
