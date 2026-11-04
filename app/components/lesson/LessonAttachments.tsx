import { Download, File } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AttachmentFormat } from '~/components/lesson/AttachmentFormat';
import { Button } from '~/components/ui/button';
import { ApiFailure } from '~/services/ApiFailure';
import { type Attachment, LessonService } from '~/services/LessonService';

export function LessonAttachments({
  courseId,
  lessonId,
  attachments,
}: {
  courseId: string;
  lessonId: string;
  attachments: Attachment[];
}) {
  return (
    <section aria-labelledby="material" className="flex flex-col gap-3">
      <h2 id="material" className="font-display text-xl font-bold">
        Material
      </h2>
      <ul className="flex flex-col divide-y rounded-md border bg-card">
        {attachments.map((attachment) => (
          <AttachmentRow
            key={attachment.id}
            courseId={courseId}
            lessonId={lessonId}
            attachment={attachment}
          />
        ))}
      </ul>
    </section>
  );
}

function AttachmentRow({
  courseId,
  lessonId,
  attachment,
}: {
  courseId: string;
  lessonId: string;
  attachment: Attachment;
}) {
  const [pending, setPending] = useState(false);

  // The signed address lasts five minutes, so it is asked for only when the reader clicks.
  async function download() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const { url } = await LessonService.attachmentDownload({
        courseId,
        lessonId,
        fileId: attachment.id,
      });
      window.location.assign(url);
    } catch (error) {
      toast.error(ApiFailure.message(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex items-center gap-3 py-2.5 pr-1.5 pl-3.5 sm:gap-3.5 sm:pr-2.5 sm:pl-4">
      <File
        aria-hidden="true"
        className="hidden size-5 shrink-0 text-muted-foreground sm:block"
      />
      <span className="flex min-w-0 flex-1 flex-col leading-snug">
        <span className="font-bold">{attachment.name}</span>
        <span className="text-sm text-muted-foreground">
          {AttachmentFormat.kind(attachment.contentType)} ·{' '}
          {AttachmentFormat.size(attachment.size)}
        </span>
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="text-link not-disabled:hover:text-link aria-disabled:cursor-progress"
        // Disabling the button would drop a keyboard user's focus while the file is asked for.
        aria-disabled={pending}
        aria-busy={pending}
        aria-label={`Baixar ${attachment.name}`}
        onClick={() => void download()}
      >
        <Download aria-hidden="true" />
        {pending ? 'Baixando…' : 'Baixar'}
      </Button>
    </li>
  );
}
