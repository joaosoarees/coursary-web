import { cn } from '~/lib/utils';

// The breaks in the dash read as chalk skipping on the board.
export function ChalkStroke({
  className,
  dashed = false,
}: {
  className?: string;
  dashed?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('h-2 w-full', className)}
    >
      <path
        d="M2 5.2 C 24 3.2, 48 6.8, 72 4.6 S 104 3.9, 118 5"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={dashed ? '3 5' : '30 1.4 22 1 70'}
      />
    </svg>
  );
}
