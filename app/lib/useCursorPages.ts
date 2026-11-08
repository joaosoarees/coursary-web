import { useState } from 'react';

import { useCursorStack } from '~/lib/useCursorStack';

export function useCursorPages<Filter>(initialFilter: Filter) {
  // Every new filter, even an equal one, starts again from the first page.
  const [{ filter, generation }, setPages] = useState({
    filter: initialFilter,
    generation: 0,
  });
  const stack = useCursorStack(String(generation));

  return {
    ...stack,
    filter,
    filterBy: (next: Filter) => {
      setPages((current) => ({
        filter: next,
        generation: current.generation + 1,
      }));
    },
  };
}
