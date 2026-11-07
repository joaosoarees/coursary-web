import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-bold whitespace-nowrap transition-[color,background-color,border-color,scale] duration-100 ease-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 motion-safe:not-disabled:not-aria-disabled:active:scale-98 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground not-disabled:not-aria-disabled:hover:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground not-disabled:not-aria-disabled:hover:bg-input/30',
        outline:
          'border border-input bg-card text-card-foreground not-disabled:not-aria-disabled:hover:border-ring not-disabled:not-aria-disabled:hover:bg-accent not-disabled:not-aria-disabled:hover:text-accent-foreground',
        ghost:
          'not-disabled:not-aria-disabled:hover:bg-accent not-disabled:not-aria-disabled:hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground not-disabled:not-aria-disabled:hover:bg-destructive-hover',
        'destructive-outline':
          'border border-destructive bg-card text-destructive not-disabled:not-aria-disabled:hover:bg-destructive/10',
        link: 'text-link underline-offset-4 not-disabled:not-aria-disabled:hover:bg-accent not-disabled:not-aria-disabled:hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-10 gap-1.5 px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      type={type ?? (asChild ? undefined : 'button')}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
