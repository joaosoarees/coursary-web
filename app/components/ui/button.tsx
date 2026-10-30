import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-bold whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground not-disabled:hover:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground not-disabled:hover:bg-input/30',
        outline:
          'border border-input bg-card text-card-foreground not-disabled:hover:border-ring not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground',
        ghost:
          'not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground not-disabled:hover:bg-destructive-hover',
        link: 'text-link underline-offset-4 not-disabled:hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-10 gap-1.5 px-4',
        icon: 'size-10',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
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
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
