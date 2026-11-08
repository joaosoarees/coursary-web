import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '~/components/ui/button';

export function CursorPager({
  label,
  index,
  range,
  pageLabel,
  canNext,
  busy,
  busyText,
  onPrevious,
  onNext,
}: {
  label: string;
  index: number;
  range: string;
  pageLabel: string;
  canNext: boolean;
  busy: boolean;
  busyText: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  // aria-disabled, not disabled: a disabled button drops the focus of whoever just pressed it.
  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t px-4 py-3.5 sm:px-5"
    >
      <span aria-live="polite" className="text-muted-foreground">
        {busy ? busyText : range}
      </span>
      <span className="flex items-center gap-3">
        <span>{pageLabel}</span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Página anterior"
          aria-disabled={index === 0}
          className="size-11"
          onClick={() => {
            if (index > 0) {
              onPrevious();
            }
          }}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Próxima página"
          aria-disabled={!canNext}
          className="size-11"
          onClick={() => {
            if (canNext) {
              onNext();
            }
          }}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </span>
    </nav>
  );
}
