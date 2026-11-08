import { useState } from 'react';

interface Pages<Filter> {
  filter: Filter;
  // The cursor that opened each page seen so far; the last one is the page on screen.
  cursors: (string | undefined)[];
}

// The API pages with cursors, so a page can only be reached from the one before it, and a new
// filter starts again from the first page.
export function useCursorPages<Filter>(initialFilter: Filter) {
  const [pages, setPages] = useState<Pages<Filter>>({
    filter: initialFilter,
    cursors: [undefined],
  });

  return {
    filter: pages.filter,
    cursor: pages.cursors.at(-1),
    index: pages.cursors.length - 1,
    next: (cursor: string) => {
      setPages((current) => ({
        ...current,
        cursors: [...current.cursors, cursor],
      }));
    },
    previous: () => {
      setPages((current) =>
        current.cursors.length > 1
          ? { ...current, cursors: current.cursors.slice(0, -1) }
          : current,
      );
    },
    filterBy: (filter: Filter) => {
      setPages({ filter, cursors: [undefined] });
    },
  };
}
