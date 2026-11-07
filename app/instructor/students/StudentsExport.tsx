import { ArrowDownToLine, Clock, LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { CourseFormat } from '~/components/course/CourseFormat';
import { Button } from '~/components/ui/button';
import { FormAlert } from '~/components/visitor/FormMessage';
import type { useStudentExport } from '~/instructor/students/useStudentExport';

type StudentExport = ReturnType<typeof useStudentExport>;

export function StudentsExportButton({ csv }: { csv: StudentExport }) {
  const link = useRef<HTMLAnchorElement>(null);
  const control = useRef<HTMLButtonElement>(null);
  const { phase } = csv;
  const previousStep = useRef(phase.step);

  // The control changes element between button and link: the focus follows it, unless the
  // person moved it elsewhere. Never on the first render.
  useEffect(() => {
    const before = previousStep.current;

    previousStep.current = phase.step;

    if (before === phase.step || document.activeElement !== document.body) {
      return;
    }

    if (phase.step === 'ready') {
      link.current?.focus();
    } else if (before === 'ready') {
      control.current?.focus();
    }
  }, [phase.step]);

  if (phase.step === 'ready') {
    return (
      <Button asChild>
        <a
          ref={link}
          href={phase.url}
          download
          onClick={(event) => {
            if (Date.now() >= phase.expiresAt) {
              event.preventDefault();
              csv.expire();
            }
          }}
        >
          <ArrowDownToLine aria-hidden="true" />
          Baixar CSV
        </a>
      </Button>
    );
  }

  const preparing = phase.step === 'preparing';

  // aria-disabled, not disabled: the button keeps the focus while the file is prepared.
  return (
    <Button
      ref={control}
      variant="outline"
      aria-disabled={preparing}
      className="aria-disabled:border-border aria-disabled:text-muted-foreground aria-disabled:opacity-100"
      onClick={() => {
        if (!preparing) {
          void csv.start();
        }
      }}
    >
      {preparing ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        <ArrowDownToLine aria-hidden="true" />
      )}
      {preparing ? 'Preparando o CSV…' : 'Exportar CSV'}
    </Button>
  );
}

export function StudentsExportStatus({ csv }: { csv: StudentExport }) {
  const { phase, notice, problem } = csv;

  return (
    <>
      {/* Always in the tree: a live region that appears with its text is often not read. */}
      <div role="status" className="not-has-[p]:sr-only">
        {phase.step === 'preparing' && (
          <span className="sr-only">Preparando o CSV…</span>
        )}
        {phase.step === 'ready' && (
          <p className="text-muted-foreground">
            {phase.rowCount === null
              ? 'O CSV está pronto.'
              : `O CSV de ${CourseFormat.count(phase.rowCount, 'aluno', 'alunos')} está pronto.`}{' '}
            O link vale por{' '}
            {CourseFormat.count(
              Math.round(phase.expiresIn / 60),
              'minuto',
              'minutos',
            )}
            ; depois, exporte de novo.
          </p>
        )}
        {notice && (
          <p className="flex max-w-prose items-start gap-2.5 rounded-lg border bg-muted px-4 py-3">
            <Clock aria-hidden="true" className="mt-0.5 size-4.5 shrink-0" />
            {notice}
          </p>
        )}
      </div>
      {problem && (
        <div className="max-w-prose">
          <FormAlert>{problem}</FormAlert>
        </div>
      )}
    </>
  );
}
