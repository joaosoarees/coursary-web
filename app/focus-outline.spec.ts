// @vitest-environment node
import { globSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

// Tailwind 4's outline-none and outline-hidden set --tw-outline-style to none, and outline-2 reads
// it: in the same class string, a focus outline then draws nothing unless outline-solid restores it.
const hidesOutline = /(?:^|\s)outline-(?:none|hidden)(?=\s|$)/;
const drawsOutline = /(?:^|\s)(?:[^\s]*:)?outline-\d/;
const restoresStyle = /(?:^|\s)(?:[^\s]*:)?outline-solid(?=\s|$)/;

const sources = globSync('app/**/*.tsx', {
  exclude: (path) => path.endsWith('.spec.tsx'),
});

const classStrings = (source: string) =>
  [...source.matchAll(/(["'`])((?:(?!\1).)*)\1/g)].map(
    ([, , text = '']) => text,
  );

describe('focus outlines', () => {
  it.each(sources)('should be visible in %s', (path) => {
    const invisible = classStrings(readFileSync(path, 'utf8')).filter(
      (text) =>
        hidesOutline.test(text) &&
        drawsOutline.test(text) &&
        !restoresStyle.test(text),
    );

    expect(invisible).toEqual([]);
  });
});
