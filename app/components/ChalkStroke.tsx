import { useId } from 'react';

import { cn } from '~/lib/utils';

const PATH = 'M2 5.2 C 24 3.2, 48 6.8, 72 4.6 S 104 3.9, 118 5';

// The breaks in the dash read as chalk skipping on the board.
export function ChalkStroke({
  className,
  dashed = false,
  draw = false,
}: {
  className?: string;
  dashed?: boolean;
  draw?: boolean;
}) {
  // A mask draws the stroke: its own dashes would fight a moving dash offset.
  const mask = `chalk-${useId().replace(/[^\w-]/g, '')}`;

  return (
    <svg
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('h-2 w-full', className)}
    >
      {draw && (
        <mask
          id={mask}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="120"
          height="8"
        >
          <path
            d={PATH}
            fill="none"
            stroke="white"
            strokeWidth={4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            className="animate-chalk-draw motion-reduce:animate-none"
          />
        </mask>
      )}
      <path
        d={PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={dashed ? 2 : 3}
        strokeLinecap="round"
        strokeDasharray={dashed ? '3 5' : '30 1.4 22 1 70'}
        mask={draw ? `url(#${mask})` : undefined}
      />
    </svg>
  );
}
