import { Clock, Download, LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { CourseFormat } from '~/components/course/CourseFormat';
import { Button } from '~/components/ui/button';
import { FormAlert } from '~/components/visitor/FormMessage';
import type { useStudentExport } from '~/instructor/students/useStudentExport';

type StudentExport = ReturnType<typeof useStudentExport>;

export function StudentsExportButton({ csv }: { csv: StudentExport }) {
  const link = useRef<HTMLAnchorElement>(null);
  const { phase } = csv;

  // The button becomes a link when the file is ready: the focus moves to it instead of the page.
  useEffect(() => {
    if (phase.step === 'ready' && document.activeElement === document.body) {
      link.current?.focus();
    }
  }, [phase.step]);

  if (phase.step === 'ready') {
    return (
      <Button asChild>
        <a ref={link} href={phase.url} download>
          <Download aria-hidden="true" />
          Baixar CSV
        </a>
      </Button>
    );
  }

  const preparing = phase.step === 'preparing';

  // aria-disabled, not disabled: the button keeps the focus while the file is prepared.
  return (
    <Button
      variant="outline"
      aria-disabled={preparing}
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
        <Download aria-hidden="true" />
      )}
      {preparing ? 'Preparando o CSV…' : 'Exportar CSV'}
    </Button>
  );
}

export function StudentsExportStatus({ csv }: { csv: StudentExport }) {
  const { phase, notice, problem } = csv;

  return (
    <>
      <div role="status" className="empty:hidden">
        {phase.step === 'ready' && (
          <p className="text-muted-foreground">
            O CSV de {CourseFormat.count(phase.rowCount, 'aluno', 'alunos')}{' '}
            está pronto. O link vale por{' '}
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
      {problem && <FormAlert>{problem}</FormAlert>}
    </>
  );
}
