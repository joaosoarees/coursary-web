import { cn } from '~/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Chalk dust crossing the block; a transform on its own layer, so nothing is repainted.
        'relative overflow-hidden rounded-md bg-accent after:absolute after:inset-0 after:animate-dust-sweep after:bg-linear-to-r after:from-transparent after:via-white/50 after:to-transparent motion-reduce:after:hidden dark:after:via-foreground/8',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
