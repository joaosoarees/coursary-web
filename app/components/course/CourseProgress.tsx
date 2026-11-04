import { CircleCheck } from 'lucide-react';

import { ChalkStroke } from '~/components/ChalkStroke';
import { cn } from '~/lib/utils';

const SEGMENTS = 6;

// A started course always shows a segment and an unfinished one always leaves one open, so the
// strokes never contradict the count beside them.
const segmentsDone = (completed: number, total: number) => {
  if (total <= 0 || completed <= 0) {
    return 0;
  }

  if (completed >= total) {
    return SEGMENTS;
  }

  return Math.min(
    SEGMENTS - 1,
    Math.max(1, Math.round((completed / total) * SEGMENTS)),
  );
};

export function CourseProgress({
  completed,
  total,
  spelledOut = false,
}: {
  completed: number;
  total: number;
  spelledOut?: boolean;
}) {
  const done = segmentsDone(completed, total);
  const finished = done === SEGMENTS;

  return (
    <div className="flex max-w-90 flex-col gap-1.5">
      <div aria-hidden="true" className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <ChalkStroke
            key={index}
            dashed={index >= done}
            className={cn(
              index >= done
                ? 'text-input'
                : finished
                  ? 'text-success'
                  : 'text-foreground',
            )}
          />
        ))}
      </div>
      {finished ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-success">
          <CircleCheck aria-hidden="true" className="size-4" />
          Concluído
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">
          {completed} de {total} aulas
          <span className={cn(!spelledOut && 'sr-only')}> concluídas</span>
        </span>
      )}
    </div>
  );
}
