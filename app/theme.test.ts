// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./app.css', import.meta.url), 'utf8');

const tokensOf = (selector: string): Record<string, string> => {
  const block = new RegExp(`(?:^|\\n)${selector} \\{([^}]*)\\}`).exec(css)?.[1];

  if (!block) {
    throw new Error(`No ${selector} block in app.css.`);
  }

  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map(
      ([, name = '', value = '']) => [name, value] as const,
    ),
  );
};

const light = tokensOf(':root');
const themes = { light, dark: { ...light, ...tokensOf('\\.dark') } };

const luminance = (hex: string) => {
  const channels = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
};

const text: [string, string][] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'card'],
  ['accent-foreground', 'accent'],
  ['destructive-foreground', 'destructive'],
  ['destructive', 'background'],
  ['destructive', 'card'],
  ['success', 'success-soft'],
  ['success', 'background'],
  ['success', 'card'],
  ['highlight-foreground', 'highlight'],
  ['link', 'background'],
  ['link', 'card'],
  ['shell-foreground', 'shell'],
  ['shell-muted', 'shell'],
  ['chalk', 'board'],
  ['chalk-yellow', 'board'],
  ['chalk-blue', 'board'],
  ['chalk-pink', 'board'],
];

// Borders a control is found by and the focus ring: WCAG asks 3:1 of non-text contrast.
const nonText: [string, string][] = [
  ['input', 'background'],
  ['input', 'card'],
  ['ring', 'background'],
  ['ring', 'card'],
];

describe.each(Object.entries(themes))('the %s theme', (_, tokens) => {
  const ratio = (fore: string, back: string) => {
    const [a, b] = [tokens[fore], tokens[back]];

    if (!a || !b) {
      throw new Error(`Missing --${!a ? fore : back}.`);
    }

    return contrast(a, b);
  };

  it.each(text)('should give %s on %s at least 4.5:1', (fore, back) => {
    expect(ratio(fore, back)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(nonText)('should give %s on %s at least 3:1', (fore, back) => {
    expect(ratio(fore, back)).toBeGreaterThanOrEqual(3);
  });
});
