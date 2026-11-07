import { CircleCheck } from 'lucide-react';
import { useState } from 'react';

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
  notStarted,
}: {
  completed: number;
  total: number;
  spelledOut?: boolean;
  /** Said instead of "0 de N aulas", where a student who never started must stand out. */
  notStarted?: string;
}) {
  const done = segmentsDone(completed, total);
  const finished = done === SEGMENTS;
  // Only segments completed while the page is open draw themselves; the ones done before it
  // opened are simply there.
  const [shown, setShown] = useState(done);
  const [drawFrom, setDrawFrom] = useState(done);

  if (done !== shown) {
    setShown(done);
    setDrawFrom(Math.min(shown, done));
  }

  return (
    <div className="flex max-w-90 flex-col gap-1.5">
      <div aria-hidden="true" className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <ChalkStroke
            key={index}
            dashed={index >= done}
            draw={index >= drawFrom && index < done}
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
      ) : notStarted && completed === 0 ? (
        <span className="text-sm text-muted-foreground">{notStarted}</span>
      ) : (
        <span className="text-sm text-muted-foreground">
          {completed} de {total} aulas
          <span className={cn(!spelledOut && 'sr-only')}> concluídas</span>
        </span>
      )}
    </div>
  );
}
