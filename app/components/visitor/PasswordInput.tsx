import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

export function PasswordInput({
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        disabled={disabled}
        type={visible ? 'text' : 'password'}
        className={cn('pr-12', className)}
      />
      <button
        type="button"
        aria-label="Mostrar senha"
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => {
          setVisible((current) => !current);
        }}
        className="absolute top-0.5 right-0.5 grid size-10 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4.5" />
        ) : (
          <Eye aria-hidden="true" className="size-4.5" />
        )}
      </button>
    </div>
  );
}
