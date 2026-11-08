import { CourseFormat } from '~/components/course/CourseFormat';
import { CursorPager } from '~/components/CursorPager';
import { STUDENTS_PAGE_SIZE } from '~/queries/students';

export class StudentsRange {
  static of(index: number, shown: number, total: number) {
    const first = index * STUDENTS_PAGE_SIZE + 1;
    const last = index * STUDENTS_PAGE_SIZE + shown;
    // The course's count is a copy that can lag behind the list; never show a page beyond it.
    const known = Math.max(total, last);

    return {
      text:
        shown === 0
          ? 'Nenhum aluno nesta página'
          : `Mostrando ${String(first)}–${String(last)} de ${String(known)}`,
      pages: Math.max(Math.ceil(known / STUDENTS_PAGE_SIZE), index + 1),
    };
  }
}

export function StudentsPager({
  index,
  shown,
  total,
  canNext,
  busy,
  onPrevious,
  onNext,
}: {
  index: number;
  shown: number;
  total: number;
  canNext: boolean;
  busy: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const range = StudentsRange.of(index, shown, total);

  if (index === 0 && !canNext && !busy) {
    return (
      <p className="border-t px-4 py-3.5 text-muted-foreground sm:px-5">
        {CourseFormat.count(shown, 'aluno', 'alunos')}
      </p>
    );
  }

  return (
    <CursorPager
      label="Páginas de alunos"
      index={index}
      range={range.text}
      pageLabel={`Página ${String(index + 1)} de ${String(range.pages)}`}
      canNext={canNext}
      busy={busy}
      busyText="Carregando os alunos…"
      onPrevious={onPrevious}
      onNext={onNext}
    />
  );
}
