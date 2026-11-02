import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '~/auth/AuthProvider';
import { AppShell } from '~/components/AppShell';
import { AccountService } from '~/services/AccountService';
import { endSession, startSession } from '~/session/session';
import { ThemeProvider } from '~/theme/ThemeProvider';

let mobile = false;

const renderShell = () => {
  const Stub = createRoutesStub([
    {
      path: '/',
      Component: () => (
        <AppShell>
          <h1>Início</h1>
        </AppShell>
      ),
    },
  ]);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <AuthProvider>
          <Stub initialEntries={['/']} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  mobile = false;
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('max-width') ? mobile : false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  startSession('token-1');
  vi.spyOn(AccountService, 'getMe').mockResolvedValue({
    id: 'account-1',
    name: 'Ana Souza',
    email: 'ana@exemplo.com',
    role: 'student',
  });
});

afterEach(() => {
  endSession();
  localStorage.clear();
});

const sidebarState = () =>
  document.querySelector('[data-slot=sidebar]')?.getAttribute('data-state');

describe('the app shell', () => {
  it('should collapse the sidebar and remember it', async () => {
    const { unmount } = renderShell();
    await screen.findByRole('heading', { name: 'Início' });

    fireEvent.click(screen.getByRole('button', { name: 'Recolher o menu' }));

    expect(sidebarState()).toBe('collapsed');
    expect(localStorage.getItem('coursary:sidebar')).toBe('false');

    unmount();
    renderShell();
    await screen.findByRole('heading', { name: 'Início' });

    expect(sidebarState()).toBe('collapsed');
    expect(screen.getByRole('button', { name: 'Abrir o menu' })).toBeVisible();
  });

  it('should toggle with Ctrl+B', async () => {
    renderShell();
    await screen.findByRole('heading', { name: 'Início' });

    act(() => {
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    });

    expect(sidebarState()).toBe('collapsed');
  });

  it('should open the menu as a drawer on a phone and close it on navigation', async () => {
    mobile = true;
    renderShell();
    await screen.findByRole('heading', { name: 'Início' });

    expect(screen.queryByRole('navigation', { name: 'Principal' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir o menu' }));

    const drawer = await screen.findByRole('dialog', { name: 'Menu' });
    expect(drawer).toBeVisible();

    fireEvent.click(screen.getByRole('link', { name: 'Início' }));

    expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull();
  });
});
