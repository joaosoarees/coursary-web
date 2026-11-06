import { useState } from 'react';
import { toast } from 'sonner';

import { ApiFailure } from '~/services/ApiFailure';
import { LessonService } from '~/services/LessonService';

// The signed address lasts five minutes, so it is asked for only when the person clicks.
export function useAttachmentDownload({
  courseId,
  lessonId,
  fileId,
}: {
  courseId: string;
  lessonId: string;
  fileId: string;
}) {
  const [pending, setPending] = useState(false);

  const download = async () => {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const { url } = await LessonService.attachmentDownload({
        courseId,
        lessonId,
        fileId,
      });
      window.location.assign(url);
    } catch (error) {
      toast.error(ApiFailure.message(error));
    } finally {
      setPending(false);
    }
  };

  return { pending, download };
}
