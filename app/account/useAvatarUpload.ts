import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { checkAvatar } from '~/account/avatarRules';
import { TOO_MANY_REQUESTS } from '~/auth/authMessages';
import { meQuery } from '~/queries/me';
import { AccountService } from '~/services/AccountService';
import { ApiFailure } from '~/services/ApiFailure';
import { S3Upload } from '~/services/S3Upload';

const POLL_MS = 2_000;
const POLL_ATTEMPTS = 10;

const UNCONFIRMED =
  'Não deu para confirmar o envio. Se a foto não aparecer em instantes, tente de novo.';
const NOT_READY =
  'A foto ainda não ficou pronta. Se ela não aparecer, tente com outra imagem.';
const REFUSED = 'A foto foi recusada. Tente com outra imagem.';

export type AvatarUploadPhase =
  | { step: 'idle' }
  | { step: 'uploading'; preview: string; progress: number }
  | { step: 'processing'; preview: string };

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<AvatarUploadPhase>({ step: 'idle' });
  const [problem, setProblem] = useState<string>();
  const gone = useRef(false);
  const preview = phase.step === 'idle' ? undefined : phase.preview;

  useEffect(() => {
    gone.current = false;

    return () => {
      gone.current = true;
    };
  }, []);

  useEffect(() => {
    if (preview === undefined) {
      return;
    }

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const refreshMe = async () => {
    const me = await AccountService.getMe().catch(() => undefined);

    if (me) {
      queryClient.setQueryData(meQuery.queryKey, me);
    } else {
      void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
    }
  };

  const waitForAvatar = async (fileId: string) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_MS);

      if (gone.current) {
        return 'gone';
      }

      let status: string | undefined;

      try {
        status = await AccountService.getAvatarUploadStatus(fileId);
      } catch (error) {
        // The record can be gone (a newer upload replaced it) or the route missing: the page
        // cannot tell what happened, so it shows whatever /me has now and stops waiting.
        if (isAxiosError(error) && error.response?.status === 404) {
          await refreshMe();

          return 'unknown';
        }
      }

      if (status === 'FAILED') {
        return 'refused';
      }

      if (status === 'PROCESSED') {
        await refreshMe();

        return 'ready';
      }
    }

    return 'waiting';
  };

  const upload = async (file: File) => {
    const checked = await checkAvatar(file);

    if ('problem' in checked) {
      setProblem(checked.problem);
      return;
    }

    const local = URL.createObjectURL(file);
    let unconfirmed = false;

    setProblem(undefined);
    setPhase({ step: 'uploading', preview: local, progress: 0 });

    let post;

    try {
      post = await AccountService.requestAvatarUpload(checked.type);
    } catch (error) {
      setPhase({ step: 'idle' });
      setProblem(ApiFailure.message(error, { TOO_MANY_REQUESTS }));
      return;
    }

    try {
      await S3Upload.post(post, file, (progress) => {
        setPhase({ step: 'uploading', preview: local, progress });
      });
    } catch (error) {
      if (!isAxiosError(error) || error.response) {
        setPhase({ step: 'idle' });
        setProblem(REFUSED);
        return;
      }

      // The browser hides S3's answer behind a network or CORS error: the photo may be stored.
      unconfirmed = true;
    }

    setPhase({ step: 'processing', preview: local });
    const outcome = await waitForAvatar(post.fileId);

    if (outcome === 'gone') {
      return;
    }

    setPhase({ step: 'idle' });

    if (outcome === 'ready') {
      toast.success('Foto atualizada.');
    } else if (outcome === 'refused') {
      setProblem(REFUSED);
    } else {
      setProblem(
        unconfirmed || outcome === 'unknown' ? UNCONFIRMED : NOT_READY,
      );
    }
  };

  return { phase, problem, upload };
}
