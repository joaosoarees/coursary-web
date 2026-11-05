import { useQueryClient } from '@tanstack/react-query';

import { useImageUpload } from '~/hooks/useImageUpload';
import { checkCover } from '~/instructor/coverRules';
import { storeManagedCourse } from '~/mutations/instructor';
import { managedCourseQuery } from '~/queries/instructor';
import { ApiFailure } from '~/services/ApiFailure';
import { InstructorService } from '~/services/InstructorService';

export const COURSE_ARCHIVED =
  'O curso foi arquivado e não pode mais ser editado.';

export function useCoverUpload(courseId: string) {
  const queryClient = useQueryClient();

  return useImageUpload({
    check: checkCover,
    request: (type) => InstructorService.requestCoverUpload(courseId, type),
    requestProblem: (error) => ApiFailure.message(error, { COURSE_ARCHIVED }),
    readStatus: (fileId) =>
      InstructorService.getCoverUploadStatus(courseId, fileId),
    refresh: async () => {
      const course = await InstructorService.get(courseId).catch(
        () => undefined,
      );

      if (course) {
        storeManagedCourse(queryClient, course);
      } else {
        void queryClient.invalidateQueries({
          queryKey: managedCourseQuery(courseId).queryKey,
        });
      }
    },
    messages: {
      ready: 'Capa atualizada.',
      refused: 'A imagem foi recusada. Tente outra, em JPEG, PNG ou WebP.',
      notReady:
        'A capa ainda não ficou pronta. Se ela não aparecer, tente com outra imagem.',
      unconfirmed:
        'Não deu para confirmar o envio. Se a capa não aparecer em instantes, tente de novo.',
    },
  });
}
