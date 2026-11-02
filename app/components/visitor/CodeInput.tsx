import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

export function CodeInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      spellCheck={false}
      className={cn(
        'h-13 text-2xl font-bold tracking-[0.35em] tabular-nums md:text-2xl',
        className,
      )}
    />
  );
}
