import { ChalkStroke } from '~/components/ChalkStroke';
import { cn } from '~/lib/utils';

const SEGMENTS = 6;

export function CourseProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const done = total > 0 ? Math.round((completed / total) * SEGMENTS) : 0;
  const finished = total > 0 && completed >= total;

  return (
    <div className="flex max-w-90 flex-col gap-1.5">
      <div
        role="img"
        aria-label={`${String(completed)} de ${String(total)} aulas concluídas`}
        className="grid grid-cols-6 gap-1.5"
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <ChalkStroke
            key={index}
            dashed={index >= done}
            className={cn(index < done ? 'text-foreground' : 'text-border')}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {finished
          ? 'Concluído'
          : `${String(completed)} de ${String(total)} aulas`}
      </span>
    </div>
  );
}
