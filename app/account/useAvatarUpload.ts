import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { avatarProblem } from '~/account/avatarRules';
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

  const waitForNewAvatar = async (previous: string | undefined) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_MS);

      if (gone.current) {
        return true;
      }

      const me = await AccountService.getMe().catch(() => undefined);
      const current = me?.avatarUrl?.['256'];

      if (me && current !== undefined && current !== previous) {
        queryClient.setQueryData(meQuery.queryKey, me);

        return true;
      }
    }

    return false;
  };

  const upload = async (file: File) => {
    const invalid = avatarProblem(file);

    if (invalid) {
      setProblem(invalid);
      return;
    }

    const previous = await queryClient
      .query({ ...meQuery, staleTime: 'static' })
      .then((me) => me.avatarUrl?.['256'])
      .catch(() => undefined);
    const local = URL.createObjectURL(file);
    let unconfirmed = false;

    setProblem(undefined);
    setPhase({ step: 'uploading', preview: local, progress: 0 });

    let post;

    try {
      post = await AccountService.requestAvatarUpload(file.type);
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
    const changed = await waitForNewAvatar(previous);

    if (gone.current) {
      return;
    }

    setPhase({ step: 'idle' });

    if (changed) {
      toast.success('Foto atualizada.');
    } else {
      setProblem(unconfirmed ? UNCONFIRMED : NOT_READY);
    }
  };

  return { phase, problem, upload };
}
