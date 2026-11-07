import { ImageUp, LoaderCircle } from 'lucide-react';
import { useId, useRef } from 'react';

import { CourseCover } from '~/components/course/CourseCover';
import { Button } from '~/components/ui/button';
import { FormAlert } from '~/components/visitor/FormMessage';
import { COVER_HINT, COVER_TYPES } from '~/instructor/coverRules';
import { useCoverUpload } from '~/instructor/useCoverUpload';
import type { ManagedCourse } from '~/services/InstructorService';

export function CoverCard({
  course,
  readOnly,
}: {
  course: ManagedCourse;
  readOnly: boolean;
}) {
  const titleId = useId();
  const hintId = useId();
  const input = useRef<HTMLInputElement>(null);
  const { phase, problem, upload } = useCoverUpload(course.id);
  const busy = phase.step !== 'idle';
  const percent =
    phase.step === 'uploading' ? Math.round(phase.progress * 100) : 100;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-sm md:p-7"
    >
      <h2 id={titleId} className="font-display text-xl font-bold">
        Capa
      </h2>
      <div className="relative">
        {busy ? (
          <img
            src={phase.preview}
            alt=""
            className="aspect-video w-full rounded-md bg-muted object-contain"
          />
        ) : (
          <CourseCover
            courseId={course.id}
            title={course.title}
            coverUrl={course.coverUrl}
            large
          />
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center rounded-md bg-black/45 text-white">
            <LoaderCircle
              aria-hidden="true"
              className="size-8 animate-spin motion-reduce:animate-none"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {phase.step === 'uploading' && (
          <div
            role="progressbar"
            aria-label="Envio da capa"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${String(percent)}%` }}
            />
          </div>
        )}
        {/* Mounted before it has text, so the first phase is announced; the percent is not. */}
        <p role="status" className="text-sm text-muted-foreground">
          {phase.step === 'uploading'
            ? 'Enviando a capa…'
            : phase.step === 'processing'
              ? 'Preparando a capa. Leva alguns segundos.'
              : ''}
          {phase.step === 'uploading' && (
            <span aria-hidden="true"> {percent}%</span>
          )}
        </p>
      </div>
      {problem && <FormAlert>{problem}</FormAlert>}
      {!readOnly && (
        <>
          <input
            ref={input}
            type="file"
            accept={COVER_TYPES.join(',')}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';

              if (file) {
                void upload(file);
              }
            }}
          />
          <div className="flex flex-col items-start gap-2">
            {/* Not disabled while busy: the button keeps the focus it had when the picker closed. */}
            <Button
              variant="outline"
              aria-disabled={busy}
              aria-describedby={hintId}
              className="aria-disabled:cursor-progress"
              onClick={() => {
                if (!busy) {
                  input.current?.click();
                }
              }}
            >
              <ImageUp aria-hidden="true" />
              {phase.step === 'uploading'
                ? 'Enviando…'
                : phase.step === 'processing'
                  ? 'Processando…'
                  : course.coverUrl
                    ? 'Trocar capa'
                    : 'Enviar capa'}
            </Button>
            <p id={hintId} className="text-sm text-muted-foreground">
              {COVER_HINT}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
