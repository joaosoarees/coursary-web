import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub, Link, Outlet } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '~/auth/AuthProvider';
import { AppShell } from '~/components/AppShell';
import { AccountService } from '~/services/AccountService';
import { endSession, startSession } from '~/session/session';
import { ThemeProvider } from '~/theme/ThemeProvider';

let mobile = false;

const renderShell = (path = '/cursos') => {
  const Stub = createRoutesStub([
    {
      path: '/cursos/*',
      Component: () => (
        <AppShell>
          <h1>Catálogo</h1>
        </AppShell>
      ),
    },
  ]);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <AuthProvider>
          <Stub initialEntries={[path]} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

const renderShellAround = () => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <AppShell>
          <Outlet />
        </AppShell>
      ),
      children: [
        { path: '/cursos', Component: () => <Link to="/perfil">Perfil</Link> },
        { path: '/perfil', Component: () => <h1>Perfil</h1> },
      ],
    },
  ]);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <AuthProvider>
          <Stub initialEntries={['/cursos']} />
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
  it('should move focus to the content after a navigation', async () => {
    renderShellAround();

    fireEvent.click(screen.getByRole('link', { name: 'Perfil' }));

    expect(
      await screen.findByRole('heading', { name: 'Perfil' }),
    ).toBeVisible();
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('should mark the catalog on a course and the enrollments inside a lesson', async () => {
    const { unmount } = renderShell('/cursos/c1');
    await screen.findByRole('heading', { name: 'Catálogo' });

    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    unmount();
    renderShell('/cursos/c1/aulas/l1');
    await screen.findByRole('heading', { name: 'Catálogo' });

    expect(
      screen.getByRole('link', { name: 'Minhas matrículas' }),
    ).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Catálogo' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should collapse the sidebar and remember it', async () => {
    const { unmount } = renderShell();
    await screen.findByRole('heading', { name: 'Catálogo' });

    fireEvent.click(screen.getByRole('button', { name: 'Recolher o menu' }));

    expect(sidebarState()).toBe('collapsed');
    expect(localStorage.getItem('coursary:sidebar')).toBe('false');

    unmount();
    renderShell();
    await screen.findByRole('heading', { name: 'Catálogo' });

    expect(sidebarState()).toBe('collapsed');
    expect(screen.getByRole('button', { name: 'Abrir o menu' })).toBeVisible();
  });

  it('should toggle with Ctrl+B', async () => {
    renderShell();
    await screen.findByRole('heading', { name: 'Catálogo' });

    act(() => {
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    });

    expect(sidebarState()).toBe('collapsed');
  });

  it('should leave Ctrl+B to a text field being typed in', async () => {
    renderShell();
    await screen.findByRole('heading', { name: 'Catálogo' });
    const field = document.createElement('textarea');
    document.body.append(field);

    act(() => {
      fireEvent.keyDown(field, { key: 'b', ctrlKey: true });
    });

    expect(sidebarState()).toBe('expanded');
    field.remove();
  });

  it('should open the menu as a drawer on a phone and close it on navigation', async () => {
    mobile = true;
    renderShell();
    await screen.findByRole('heading', { name: 'Catálogo' });

    expect(screen.queryByRole('navigation', { name: 'Principal' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir o menu' }));

    const drawer = await screen.findByRole('dialog', { name: 'Menu' });
    expect(drawer).toBeVisible();

    fireEvent.click(screen.getByRole('link', { name: 'Catálogo' }));

    expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull();
  });
});
