import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useUnsavedChangesWarning } from '~/hooks/useUnsavedChangesWarning';
import { COURSE_ARCHIVED } from '~/instructor/instructorMessages';
import { checkVideo, VIDEO_TYPE } from '~/instructor/lesson/videoRules';
import { lessonQuery } from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import { type LessonContent, LessonService } from '~/services/LessonService';
import {
  type MultipartSteps,
  MultipartUpload,
  UploadStoppedError,
} from '~/services/multipart/MultipartUpload';
import { type LessonRef, VideoService } from '~/services/VideoService';

const POLL_MS = 1_000;
const POLL_ATTEMPTS = 20;

export type VideoUploadPhase =
  | { step: 'idle' }
  | { step: 'uploading'; name: string; loaded: number; total: number }
  | { step: 'confirming' };

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

class VideoUploadSteps {
  static of(lesson: LessonRef, file: File): MultipartSteps {
    return {
      start: (signal) =>
        VideoService.start(
          lesson,
          { contentType: VIDEO_TYPE, size: file.size },
          signal,
        ),
      partUrls: (fileId, partNumbers, signal) =>
        VideoService.partUrls(lesson, fileId, partNumbers, signal),
      complete: (fileId, parts) => VideoService.complete(lesson, fileId, parts),
      abort: (fileId) => VideoService.abort(lesson, fileId),
    };
  }

  static problem(error: unknown): string {
    if (error instanceof UploadStoppedError) {
      return `O envio parou na parte ${String(error.partNumber)} de ${String(error.partCount)}. Confira a conexão e envie de novo; o que chegou foi descartado.`;
    }

    const unreachable = isAxiosError(error) && error.response === undefined;

    if (unreachable || ApiFailure.codeOf(error) === 'COURSE_ARCHIVED') {
      return ApiFailure.message(error, { COURSE_ARCHIVED });
    }

    return 'Não foi possível enviar o vídeo. Tente de novo; o que chegou foi descartado.';
  }
}

export function useVideoUpload(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<VideoUploadPhase>({ step: 'idle' });
  const [problem, setProblem] = useState<string>();
  // Not a failure: the upload went through and the video is still on its way.
  const [notice, setNotice] = useState<string>();
  const running = useRef<AbortController>(undefined);
  const gone = useRef(false);
  const uploading = phase.step === 'uploading';

  useUnsavedChangesWarning(uploading);

  // Leaving the page cancels the upload, and the cancel aborts it on the API.
  useEffect(() => {
    gone.current = false;

    return () => {
      gone.current = true;
      running.current?.abort();
    };
  }, []);

  // The signed address names the file: the new video is in the lesson once its id is in there.
  const waitForVideo = async (fileId: string) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await wait(POLL_MS);

      if (gone.current) {
        return false;
      }

      try {
        const content = await LessonService.open({ courseId, lessonId });
        const video = content.video;

        if (video?.url.includes(`/${fileId}/`)) {
          // Only the video is taken: the rest of the cache may hold a move still in flight.
          queryClient.setQueryData<LessonContent>(
            lessonQuery(courseId, lessonId).queryKey,
            (current) => (current ? { ...current, video } : content),
          );

          return true;
        }
      } catch {
        // A failed read is asked again on the next turn.
      }
    }

    return false;
  };

  const upload = async (file: File) => {
    // One video per lesson: a second pick while one goes up would leave the first uncancellable.
    if (running.current) {
      return;
    }

    const refused = checkVideo(file);

    if (refused) {
      setProblem(refused.problem);
      return;
    }

    const controller = new AbortController();
    const steps = VideoUploadSteps.of({ courseId, lessonId }, file);
    const total = file.size;

    running.current = controller;
    setProblem(undefined);
    setNotice(undefined);
    setPhase({ step: 'uploading', name: file.name, loaded: 0, total });

    let fileId: string;

    try {
      fileId = await MultipartUpload.send(
        file,
        steps,
        (loaded) => {
          setPhase({ step: 'uploading', name: file.name, loaded, total });
        },
        controller.signal,
      );
    } catch (error) {
      if (gone.current) {
        return;
      }

      setPhase({ step: 'idle' });

      if (controller.signal.aborted) {
        toast.message('Envio cancelado.');
      } else {
        console.error(error);
        setProblem(VideoUploadSteps.problem(error));
      }

      return;
    } finally {
      running.current = undefined;
    }

    setPhase({ step: 'confirming' });
    const ready = await waitForVideo(fileId);

    if (gone.current) {
      return;
    }

    setPhase({ step: 'idle' });

    if (ready) {
      toast.success('Vídeo enviado.');
    } else {
      setNotice(
        'O vídeo foi enviado, mas ainda não apareceu. Recarregue a página em instantes.',
      );
    }
  };

  const cancel = () => {
    running.current?.abort(
      new DOMException('The upload was cancelled.', 'AbortError'),
    );
  };

  return { phase, problem, notice, uploading, upload, cancel };
}
