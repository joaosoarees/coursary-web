import { cn } from '~/lib/utils';

// The value is read from the page's CSS once the element is in it, so the page shows what the
// stylesheet holds and cannot drift from app.css. Tailwind leaves out a theme variable no class
// uses, which then reads as empty.
export function CssValue({
  read,
  className,
}: {
  read: (element: HTMLElement) => string;
  className?: string;
}) {
  return (
    <code
      ref={(element) => {
        if (element) {
          element.textContent = read(element).trim() || 'não definido';
        }
      }}
      className={cn('text-xs', className)}
    />
  );
}

export const cssVariable = (name: string) => (element: HTMLElement) =>
  getComputedStyle(element).getPropertyValue(name);
