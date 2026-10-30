import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '~/theme/ThemeProvider';
import { ThemeSwitcher } from '~/theme/ThemeSwitcher';

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
});

describe('ThemeSwitcher', () => {
  it('should offer the three themes and mark the chosen one', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Sistema' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Escuro' }));

    expect(screen.getByRole('button', { name: 'Escuro' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Sistema' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(document.documentElement).toHaveClass('dark');
  });
});
