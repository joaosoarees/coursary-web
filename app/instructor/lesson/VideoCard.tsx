import { LoaderCircle, Upload, Video } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '~/components/ConfirmDialog';
import { Button } from '~/components/ui/button';
import { FormAlert } from '~/components/visitor/FormMessage';
import { focusLater, focusMark } from '~/instructor/content/contentFocus';
import type { useVideoUpload } from '~/instructor/lesson/useVideoUpload';
import { VIDEO_ACCEPT, VIDEO_HINT } from '~/instructor/lesson/videoRules';
import { useDeleteVideo } from '~/mutations/video';
import { ApiFailure } from '~/services/ApiFailure';
import type { SignedUrl } from '~/services/LessonService';

const MIB = 1024 * 1024;

const WHOLE = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
  useGrouping: 'always',
});

class VideoProgress {
  static percent(loaded: number, total: number): number {
    return total === 0 ? 0 : Math.floor((loaded / total) * 100);
  }

  // Truncated like the percent, so the two never disagree on the same line.
  static megabytes(loaded: number, total: number): string {
    return `${WHOLE.format(Math.floor(loaded / MIB))} de ${WHOLE.format(total / MIB)} MB`;
  }
}

export function VideoCard({
  courseId,
  lessonId,
  video,
  readOnly,
  upload,
}: {
  courseId: string;
  lessonId: string;
  video: SignedUrl | undefined;
  readOnly: boolean;
  upload: ReturnType<typeof useVideoUpload>;
}) {
  const titleId = useId();
  const hintId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState(false);
  const [unplayable, setUnplayable] = useState<string>();
  const remove = useDeleteVideo(courseId, lessonId);
  const { phase, problem } = upload;
  const busy = phase.step !== 'idle';
  const sendMark = `video-send-${lessonId}`;
  const removeMark = `video-remove-${lessonId}`;
  // Back on Remover when the person stays; on the send button once the video is gone.
  const afterRemove = useRef(removeMark);

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-sm md:p-7"
    >
      <h2 id={titleId} className="font-display text-xl font-bold">
        Vídeo
      </h2>
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-md bg-black text-white">
        {busy ? (
          <span className="flex flex-col items-center gap-2.5 font-bold">
            <LoaderCircle
              aria-hidden="true"
              className="size-7 animate-spin motion-reduce:animate-none"
            />
            {phase.step === 'uploading'
              ? `Enviando… ${String(VideoProgress.percent(phase.loaded, phase.total))}%`
              : 'Confirmando…'}
          </span>
        ) : video && unplayable !== video.url ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- the API stores no captions for a lesson.
          <video
            key={video.url}
            src={video.url}
            controls
            playsInline
            preload="metadata"
            aria-label="Vídeo da aula"
            className="absolute inset-0 size-full"
            onError={() => {
              setUnplayable(video.url);
            }}
          />
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center font-bold text-white/80">
            <Video aria-hidden="true" className="size-7" />
            {video
              ? 'Não deu para carregar o vídeo. Recarregue a página.'
              : 'Sem vídeo'}
          </span>
        )}
      </div>
      <div role="status" className="flex flex-col gap-1.5 empty:hidden">
        {phase.step === 'uploading' && (
          <>
            <div
              role="progressbar"
              aria-label="Envio do vídeo"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={VideoProgress.percent(phase.loaded, phase.total)}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full bg-primary transition-[width] motion-reduce:transition-none"
                style={{
                  width: `${String(VideoProgress.percent(phase.loaded, phase.total))}%`,
                }}
              />
            </div>
            <span className="flex flex-wrap justify-between gap-x-3 text-muted-foreground">
              <span className="min-w-0 [overflow-wrap:anywhere]">
                Enviando {phase.name}…
              </span>
              <span aria-hidden="true" className="whitespace-nowrap">
                {VideoProgress.megabytes(phase.loaded, phase.total)} ·{' '}
                {VideoProgress.percent(phase.loaded, phase.total)}%
              </span>
            </span>
            {video && (
              <span className="text-muted-foreground">
                Enviando o vídeo novo; o atual continua no ar até ele ficar
                pronto.
              </span>
            )}
          </>
        )}
        {phase.step === 'confirming' && (
          <span className="text-muted-foreground">
            Confirmando o vídeo. Leva alguns segundos.
          </span>
        )}
      </div>
      {problem && <FormAlert>{problem}</FormAlert>}
      {!readOnly && (
        <>
          <input
            ref={input}
            type="file"
            accept={VIDEO_ACCEPT}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';

              if (file) {
                void upload.upload(file);
              }
            }}
          />
          <div className="flex flex-wrap gap-3">
            {phase.step === 'uploading' ? (
              <Button
                variant="destructive-outline"
                onClick={() => {
                  upload.cancel();
                  focusLater(sendMark);
                }}
              >
                Cancelar envio
              </Button>
            ) : (
              <>
                {/* Not disabled while confirming: the button keeps the focus it had. */}
                <Button
                  variant="outline"
                  aria-disabled={busy}
                  aria-describedby={hintId}
                  className={busy ? 'aria-disabled:cursor-progress' : undefined}
                  onClick={() => {
                    if (!busy) {
                      input.current?.click();
                    }
                  }}
                  {...focusMark(sendMark)}
                >
                  <Upload aria-hidden="true" />
                  {video ? 'Trocar vídeo' : 'Enviar vídeo'}
                </Button>
                {video && (
                  <Button
                    variant="destructive-outline"
                    aria-disabled={busy}
                    onClick={() => {
                      if (!busy) {
                        afterRemove.current = removeMark;
                        setRemoving(true);
                      }
                    }}
                    {...focusMark(removeMark)}
                  >
                    Remover vídeo
                  </Button>
                )}
              </>
            )}
          </div>
          <p id={hintId} className="text-sm text-muted-foreground">
            {VIDEO_HINT}
          </p>
        </>
      )}
      <ConfirmDialog
        open={removing}
        onClose={() => {
          setRemoving(false);
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          focusLater(afterRemove.current);
        }}
        pending={remove.isPending}
        error={remove.error && ApiFailure.message(remove.error)}
        onReset={remove.reset}
        title="Remover o vídeo desta aula?"
        description="Os alunos deixam de vê-lo. Isso não pode ser desfeito."
        confirm={{
          label: 'Remover o vídeo',
          pending: 'Removendo…',
          destructive: true,
        }}
        onConfirm={() => {
          remove.mutate(undefined, {
            onSuccess: () => {
              afterRemove.current = sendMark;
              setRemoving(false);
              toast.success('Vídeo removido.');
            },
          });
        }}
      />
    </section>
  );
}
