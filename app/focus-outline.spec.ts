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

const quoted = (text: string, across: RegExp) =>
  [...text.matchAll(across)].map(([, , content = '']) => content);
const oneLine = /(["'`])((?:(?!\1).)*)\1/g;
const anyLines = /(["'`])((?:(?!\1)[\s\S])*)\1/g;

// Every argument of a cn() or cva() call lands on the same element, so they are checked together.
const callArguments = (source: string) =>
  [...source.matchAll(/\b(?:cn|cva)\(/g)].map(({ index }) => {
    const start = index + source.slice(index).indexOf('(');
    let depth = 0;
    let quote = '';
    let end = start;

    for (; end < source.length; end++) {
      const char = source.charAt(end);

      if (quote) {
        quote = char === quote ? '' : quote;
      } else if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '(') {
        depth++;
      } else if (char === ')' && --depth === 0) {
        break;
      }
    }

    return quoted(source.slice(start, end), anyLines).join(' ');
  });

const classStrings = (source: string) => [
  ...callArguments(source),
  ...quoted(source, oneLine),
];

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
