import { Button } from '~/components/ui/button';
import { useLoadMoreOnIntersect } from '~/hooks/useLoadMoreOnIntersect';
import { cn } from '~/lib/utils';

interface InfiniteList {
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  fetchNextPage: (options?: { cancelRefetch?: boolean }) => Promise<unknown>;
}

export function LoadMore({
  list,
  labels,
  auto = true,
  size,
  className,
  children,
}: {
  list: InfiniteList;
  labels: { more: string; loading: string; failed: string };
  auto?: boolean;
  size?: 'default' | 'sm';
  className?: string;
  children?: React.ReactNode;
}) {
  const {
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
  } = list;
  const loadMore = () => {
    void fetchNextPage({ cancelRefetch: false });
  };
  const sentinelRef = useLoadMoreOnIntersect({
    loadMore,
    hasMore:
      hasNextPage &&
      !(isFetching && !isFetchingNextPage) &&
      !isFetchNextPageError,
    isLoadingMore: isFetchingNextPage,
  });

  return (
    <>
      {auto && <div ref={sentinelRef} aria-hidden="true" />}
      <div className={cn('flex flex-col gap-2.5', className)}>
        {isFetchNextPageError && (
          <p role="alert" className="text-destructive">
            {labels.failed}
          </p>
        )}
        {hasNextPage && (
          <Button
            variant="outline"
            size={size}
            disabled={isFetching}
            onClick={loadMore}
          >
            {isFetchingNextPage
              ? labels.loading
              : isFetchNextPageError
                ? 'Tentar de novo'
                : labels.more}
          </Button>
        )}
        {children}
      </div>
    </>
  );
}
