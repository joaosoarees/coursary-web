import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '~/components/ui/button';

// aria-disabled at the ends, not disabled: the focused button stays focused after the last move.
export function MoveButtons({
  what,
  first,
  last,
  onMove,
}: {
  what: string;
  first: boolean;
  last: boolean;
  onMove: (offset: -1 | 1) => void;
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Subir ${what}`}
        aria-disabled={first}
        onClick={() => {
          if (!first) {
            onMove(-1);
          }
        }}
      >
        <ChevronUp aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Descer ${what}`}
        aria-disabled={last}
        onClick={() => {
          if (!last) {
            onMove(1);
          }
        }}
      >
        <ChevronDown aria-hidden="true" />
      </Button>
    </>
  );
}
