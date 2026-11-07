import { useState } from 'react';

import type { StudentOrder } from '~/services/StudentService';

interface Pages {
  order: StudentOrder;
  // The cursor that opened each page seen so far; the last one is the page on screen.
  cursors: (string | undefined)[];
}

const FIRST: Pages = { order: 'desc', cursors: [undefined] };

// The API pages with cursors, so a page can only be reached from the one before it.
export function useStudentPages() {
  const [pages, setPages] = useState(FIRST);

  return {
    order: pages.order,
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
    sortBy: (order: StudentOrder) => {
      setPages({ order, cursors: [undefined] });
    },
  };
}
