import { runInNewContext } from 'node:vm';

import { afterEach, describe, expect, it } from 'vitest';

import { THEME_STORAGE_KEY, themeScript } from '~/theme/themeScript';

const run = ({
  stored,
  systemDark = false,
  storageThrows = false,
}: {
  stored?: string;
  systemDark?: boolean;
  storageThrows?: boolean;
}) => {
  const window = {
    localStorage: {
      getItem: (key: string) => {
        if (storageThrows) {
          throw new Error('blocked');
        }

        return key === THEME_STORAGE_KEY ? (stored ?? null) : null;
      },
    },
    matchMedia: () => ({ matches: systemDark }),
  };

  runInNewContext(themeScript, { window, document });

  return document.documentElement.className;
};

afterEach(() => {
  document.documentElement.className = '';
});

describe('themeScript', () => {
  it('should apply the stored choice before the app runs', () => {
    expect(run({ stored: 'dark' })).toBe('dark');
  });

  it('should resolve system, or nothing stored, from the system', () => {
    expect(run({ stored: 'system', systemDark: true })).toBe('dark');
    document.documentElement.className = '';
    expect(run({ systemDark: false })).toBe('light');
  });

  it('should fall back to the system on an unknown value or blocked storage', () => {
    expect(run({ stored: 'blue', systemDark: true })).toBe('dark');
    document.documentElement.className = '';
    expect(run({ storageThrows: true })).toBe('light');
  });
});
