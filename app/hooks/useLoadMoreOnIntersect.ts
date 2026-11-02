import { useEffect, useEffectEvent, useState } from 'react';

export function useLoadMoreOnIntersect({
  loadMore,
  hasMore,
  isLoadingMore,
  rootMargin = '0px 0px 400px 0px',
}: {
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  rootMargin?: string;
}) {
  const [sentinel, setSentinel] = useState<Element | null>(null);

  const onReachEnd = useEffectEvent(() => {
    loadMore();
  });

  const canLoad = hasMore && !isLoadingMore;

  useEffect(() => {
    if (!canLoad || sentinel === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, self) => {
        // Several entries can arrive at once; the last one is where the sentinel is now.
        if (entries.at(-1)?.isIntersecting) {
          self.disconnect();
          onReachEnd();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [canLoad, sentinel, rootMargin]);

  return setSentinel;
}
