import { useQueryClient } from '@tanstack/react-query';

import { checkAvatar } from '~/account/avatarRules';
import { TOO_MANY_REQUESTS } from '~/auth/authMessages';
import { useFileUpload } from '~/hooks/useFileUpload';
import { meQuery } from '~/queries/me';
import { AccountService } from '~/services/AccountService';
import { ApiFailure } from '~/services/ApiFailure';

export function useAvatarUpload() {
  const queryClient = useQueryClient();

  return useFileUpload({
    check: checkAvatar,
    request: (type) => AccountService.requestAvatarUpload(type),
    requestProblem: (error) => ApiFailure.message(error, { TOO_MANY_REQUESTS }),
    readStatus: (fileId) => AccountService.getAvatarUploadStatus(fileId),
    refresh: async () => {
      const me = await AccountService.getMe().catch(() => undefined);

      if (me) {
        queryClient.setQueryData(meQuery.queryKey, me);
      } else {
        void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      }
    },
    messages: {
      ready: 'Foto atualizada.',
      refused: 'A foto foi recusada. Tente com outra imagem.',
      notReady:
        'A foto ainda não ficou pronta. Se ela não aparecer, tente com outra imagem.',
      unconfirmed:
        'Não deu para confirmar o envio. Se a foto não aparecer em instantes, tente de novo.',
    },
  });
}
