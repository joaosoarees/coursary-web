import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AuthGuard } from '~/auth/AuthGuard';
import { AuthProvider } from '~/auth/AuthProvider';
import { endSession, startSession } from '~/session/session';

afterEach(() => {
  endSession();
});

const mount = (initialEntry: string | { pathname: string; state: unknown }) => {
  const router = createMemoryRouter(
    [
      {
        element: <AuthGuard isPrivate />,
        children: [{ path: '/cursos', element: <h1>Cursos</h1> }],
      },
      {
        element: <AuthGuard isPrivate={false} />,
        children: [{ path: '/entrar', element: <h1>Entrar</h1> }],
      },
      { path: '/', element: <h1>Início</h1> },
    ],
    { initialEntries: [initialEntry] },
  );

  render(
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>,
  );

  return router;
};

describe('AuthGuard', () => {
  it('should send a visitor to sign-in and remember where they were going', async () => {
    const router = mount('/cursos?pagina=2');

    expect(
      await screen.findByRole('heading', { name: 'Entrar' }),
    ).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Cursos' })).toBeNull();
    expect(router.state.location.state).toEqual({ from: '/cursos?pagina=2' });
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('should send a signed-in reader back where they were going', async () => {
    const router = mount({
      pathname: '/entrar',
      state: { from: '/cursos?pagina=2' },
    });

    act(() => {
      startSession('token-1');
    });

    expect(
      await screen.findByRole('heading', { name: 'Cursos' }),
    ).toBeVisible();
    expect(router.state.location.search).toBe('?pagina=2');
  });

  it('should not follow a path to another origin', async () => {
    startSession('token-1');
    mount({ pathname: '/entrar', state: { from: '//evil.example/x' } });

    expect(
      await screen.findByRole('heading', { name: 'Início' }),
    ).toBeVisible();
  });

  it('should send the reader to sign-in when the session ends', async () => {
    startSession('token-1');
    mount('/cursos');
    expect(
      await screen.findByRole('heading', { name: 'Cursos' }),
    ).toBeVisible();

    act(() => {
      endSession();
    });

    expect(
      await screen.findByRole('heading', { name: 'Entrar' }),
    ).toBeVisible();
  });
});
