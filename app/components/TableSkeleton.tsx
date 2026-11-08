import { Skeleton } from '~/components/ui/skeleton';

// The shape of a table card on its way: a header row and a few rows.
export function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border bg-card shadow-sm"
    >
      <div className="flex h-12 items-center border-b px-4 sm:px-5">
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="flex h-15 items-center gap-6 border-b px-4 last:border-b-0 sm:px-5"
        >
          <Skeleton className="h-4 flex-[2]" />
          <Skeleton className="hidden h-4 flex-[2] sm:block" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}
