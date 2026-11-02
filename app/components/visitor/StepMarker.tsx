import { ChalkStroke } from '~/components/ChalkStroke';
import { cn } from '~/lib/utils';

export function StepMarker({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <ChalkStroke
            key={index}
            dashed={index >= current}
            className={cn(
              'w-14',
              index < current ? 'text-primary' : 'text-input',
            )}
          />
        ))}
      </span>
      <span className="text-sm text-muted-foreground">
        Etapa {current} de {total}
      </span>
    </div>
  );
}
