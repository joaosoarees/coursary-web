import { Star } from 'lucide-react';

import { CourseFormat } from '~/components/course/CourseFormat';

export function CourseRating({
  average,
  count,
}: {
  average: number | null;
  count: number;
}) {
  if (average === null) {
    return <span>Sem avaliações</span>;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Star aria-hidden="true" className="size-4 fill-current text-star" />
      <span>
        <span className="sr-only">Nota </span>
        {CourseFormat.rating(average)} ({count})
      </span>
    </span>
  );
}
