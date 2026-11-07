import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { STUDENTS_PAGE_SIZE } from '~/queries/students';

export class StudentsRange {
  static of(index: number, shown: number, total: number) {
    const first = index * STUDENTS_PAGE_SIZE + 1;
    const last = index * STUDENTS_PAGE_SIZE + shown;
    // The course's count is a copy that can lag behind the list; never show a page beyond it.
    const known = Math.max(total, last);

    return {
      text: `Mostrando ${String(first)}–${String(last)} de ${String(known)}`,
      pages: Math.max(Math.ceil(known / STUDENTS_PAGE_SIZE), index + 1),
    };
  }
}

export function StudentsPager({
  index,
  shown,
  total,
  canNext,
  onPrevious,
  onNext,
}: {
  index: number;
  shown: number;
  total: number;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const range = StudentsRange.of(index, shown, total);

  return (
    <nav
      aria-label="Páginas de alunos"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t px-5 py-3.5"
    >
      <span className="text-muted-foreground">{range.text}</span>
      <span className="flex items-center gap-3">
        <span>
          Página {index + 1} de {range.pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Página anterior"
          disabled={index === 0}
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Próxima página"
          disabled={!canNext}
          onClick={onNext}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </span>
    </nav>
  );
}
