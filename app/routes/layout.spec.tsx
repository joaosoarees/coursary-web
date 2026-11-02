import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { createRoutesStub, Link } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '~/auth/AuthProvider';
import Layout, { ErrorBoundary } from '~/routes/layout';
import NotFound, { clientLoader as notFoundLoader } from '~/routes/not-found';
import { AccountService } from '~/services/AccountService';
import { endSession, startSession } from '~/session/session';
import { ThemeProvider } from '~/theme/ThemeProvider';

function Broken(): React.ReactNode {
  throw new Error('render failed');
}

let flakyFails = true;

function Flaky() {
  if (flakyFails) {
    throw new Error('first render failed');
  }

  return <p>Voltou</p>;
}

const Stub = createRoutesStub([
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: ErrorBoundary as never,
    children: [
      {
        path: 'cursos',
        Component: () => <Link to="/quebrada">Abrir a página quebrada</Link>,
      },
      { path: 'quebrada', Component: Broken },
      { path: 'instavel', Component: Flaky },
      { path: '*', loader: notFoundLoader, Component: NotFound },
    ],
  },
  { path: '/entrar', Component: () => <h1>Entrar</h1> },
]);

const renderAt = (path: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <AuthProvider>
          <Stub initialEntries={[path]} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );

beforeEach(() => {
  flakyFails = true;
  startSession('token-1');
  vi.spyOn(AccountService, 'getMe').mockResolvedValue({
    id: 'account-1',
    name: 'Ana Souza',
    email: 'ana@exemplo.com',
    role: 'student',
  });
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  endSession();
});

describe('the layout', () => {
  it('should show a broken page inside the navigation', async () => {
    renderAt('/quebrada');

    expect(
      await screen.findByRole('heading', { name: 'Algo deu errado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Principal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tentar de novo' }),
    ).toBeInTheDocument();
  });

  it('should answer an unknown address with the not-found page, without retry', async () => {
    renderAt('/nao-existe');

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Principal' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tentar de novo' }),
    ).not.toBeInTheDocument();
  });

  it('should send a visitor at an unknown address to sign-in', async () => {
    endSession();
    renderAt('/nao-existe');

    expect(
      await screen.findByRole('heading', { name: 'Entrar' }),
    ).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Principal' })).toBeNull();
  });

  it('should leave the error behind on navigation', async () => {
    renderAt('/quebrada');
    await screen.findByRole('heading', { name: 'Algo deu errado' });

    act(() => {
      screen.getByRole('link', { name: 'Catálogo' }).click();
    });

    expect(
      await screen.findByRole('link', { name: 'Abrir a página quebrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should try the page again in place', async () => {
    renderAt('/instavel');
    await screen.findByRole('heading', { name: 'Algo deu errado' });
    flakyFails = false;

    act(() => {
      screen.getByRole('button', { name: 'Tentar de novo' }).click();
    });

    expect(await screen.findByText('Voltou')).toBeInTheDocument();
  });
});
