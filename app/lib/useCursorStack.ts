import { useState } from 'react';

interface Stack {
  key: string;
  // The cursor that opened each page seen so far; the last one is the page on screen.
  cursors: (string | undefined)[];
}

// The API pages with cursors, so a page can only be reached from the one before it. A new key (a
// new filter) starts again from the first page.
export function useCursorStack(key: string) {
  const [stack, setStack] = useState<Stack>({ key, cursors: [undefined] });

  if (stack.key !== key) {
    setStack({ key, cursors: [undefined] });
  }

  const cursors = stack.key === key ? stack.cursors : [undefined];

  return {
    cursor: cursors.at(-1),
    index: cursors.length - 1,
    next: (cursor: string) => {
      setStack((current) => ({
        ...current,
        cursors: [...current.cursors, cursor],
      }));
    },
    previous: () => {
      setStack((current) =>
        current.cursors.length > 1
          ? { ...current, cursors: current.cursors.slice(0, -1) }
          : current,
      );
    },
  };
}
