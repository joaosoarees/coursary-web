import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '~/theme/ThemeProvider';
import { THEME_STORAGE_KEY } from '~/theme/themeScript';
import { useTheme } from '~/theme/useTheme';

let systemDark = false;
const listeners = new Set<() => void>();

const setSystemDark = (dark: boolean) => {
  systemDark = dark;
  act(() => {
    listeners.forEach((listener) => {
      listener();
    });
  });
};

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <p>
        {theme}/{resolvedTheme}
      </p>
      <button
        type="button"
        onClick={() => {
          setTheme('dark');
        }}
      >
        escuro
      </button>
    </>
  );
}

const renderProvider = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

beforeEach(() => {
  systemDark = false;
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return systemDark;
    },
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  }));
});

afterEach(() => {
  localStorage.clear();
  listeners.clear();
  document.documentElement.className = '';
});

describe('ThemeProvider', () => {
  it('should follow the system when nothing was chosen, and its later changes', () => {
    systemDark = true;
    renderProvider();

    expect(screen.getByText('system/dark')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');

    setSystemDark(false);

    expect(screen.getByText('system/light')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('should start from the stored choice and ignore a value that is not a theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { unmount } = renderProvider();

    expect(screen.getByText('dark/dark')).toBeInTheDocument();
    unmount();

    localStorage.setItem(THEME_STORAGE_KEY, 'blue');
    renderProvider();

    expect(screen.getByText('system/light')).toBeInTheDocument();
  });

  it('should store a new choice and apply it', () => {
    renderProvider();

    act(() => {
      screen.getByRole('button', { name: 'escuro' }).click();
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('should still work when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    renderProvider();

    act(() => {
      screen.getByRole('button', { name: 'escuro' }).click();
    });

    expect(screen.getByText('dark/dark')).toBeInTheDocument();
  });

  it('should follow a choice made in another tab', () => {
    renderProvider();

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: THEME_STORAGE_KEY,
          newValue: 'dark',
        }),
      );
    });

    expect(screen.getByText('dark/dark')).toBeInTheDocument();
  });

  it('should refuse useTheme outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow('outside `ThemeProvider`');
  });
});
