import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type PresignedPost, S3Upload } from '~/services/S3Upload';

const POLL_MS = 2_000;
const POLL_ATTEMPTS = 10;

export type FileUploadPhase =
  | { step: 'idle' }
  | { step: 'uploading'; preview: string; progress: number }
  | { step: 'processing'; preview: string };

export interface FileUploadSteps {
  check: (file: File) => Promise<{ type: string } | { problem: string }>;
  request: (
    type: string,
    file: File,
  ) => Promise<PresignedPost & { fileId: string }>;
  requestProblem: (error: unknown) => string;
  readStatus: (fileId: string) => Promise<string>;
  // Called once the file is processed, or when its record is gone, to show what the owner has now.
  refresh: () => Promise<void>;
  messages: {
    ready: string;
    refused: string;
    notReady: string;
    unconfirmed: string;
  };
}

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function useFileUpload(steps: FileUploadSteps) {
  const [phase, setPhase] = useState<FileUploadPhase>({ step: 'idle' });
  const [problem, setProblem] = useState<string>();
  const gone = useRef(false);
  const preview = phase.step === 'idle' ? undefined : phase.preview;
  const { messages } = steps;

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

  const waitForFile = async (fileId: string) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_MS);

      if (gone.current) {
        return 'gone';
      }

      let status: string | undefined;

      try {
        status = await steps.readStatus(fileId);
      } catch (error) {
        // The record can be gone (a newer upload replaced it) or the route missing: the page
        // cannot tell what happened, so it shows what the owner has now and stops waiting.
        if (isAxiosError(error) && error.response?.status === 404) {
          await steps.refresh();

          return 'unknown';
        }
      }

      if (status === 'FAILED') {
        return 'refused';
      }

      if (status === 'PROCESSED') {
        await steps.refresh();

        return 'ready';
      }
    }

    return 'waiting';
  };

  const upload = async (file: File) => {
    const checked = await steps.check(file);

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
      post = await steps.request(checked.type, file);
    } catch (error) {
      setPhase({ step: 'idle' });
      setProblem(steps.requestProblem(error));
      return;
    }

    try {
      await S3Upload.post(post, file, (progress) => {
        setPhase({ step: 'uploading', preview: local, progress });
      });
    } catch (error) {
      if (!isAxiosError(error) || error.response) {
        setPhase({ step: 'idle' });
        setProblem(messages.refused);
        return;
      }

      // The browser hides S3's answer behind a network or CORS error: the file may be stored.
      unconfirmed = true;
    }

    setPhase({ step: 'processing', preview: local });
    const outcome = await waitForFile(post.fileId);

    if (outcome === 'gone') {
      return;
    }

    setPhase({ step: 'idle' });

    if (outcome === 'ready') {
      toast.success(messages.ready);
    } else if (outcome === 'refused') {
      setProblem(messages.refused);
    } else {
      setProblem(
        unconfirmed || outcome === 'unknown'
          ? messages.unconfirmed
          : messages.notReady,
      );
    }
  };

  return { phase, problem, upload };
}
