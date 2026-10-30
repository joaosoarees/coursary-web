import { act, render, screen } from '@testing-library/react';
import { createRoutesStub, data, Link } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Layout, { ErrorBoundary } from '~/routes/layout';
import { ThemeProvider } from '~/theme/ThemeProvider';

function Broken(): React.ReactNode {
  throw new Error('render failed');
}

const Stub = createRoutesStub([
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: ErrorBoundary as never,
    children: [
      {
        index: true,
        Component: () => <Link to="/quebrada">Abrir a página quebrada</Link>,
      },
      { path: 'quebrada', Component: Broken },
      {
        path: '*',
        loader: () => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error -- a thrown data() is a 404 response.
          throw data(null, { status: 404 });
        },
        Component: () => null,
      },
    ],
  },
]);

const renderAt = (path: string) =>
  render(
    <ThemeProvider>
      <Stub initialEntries={[path]} />
    </ThemeProvider>,
  );

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
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

  it('should leave the error behind on navigation', async () => {
    renderAt('/quebrada');
    await screen.findByRole('heading', { name: 'Algo deu errado' });

    act(() => {
      screen.getByRole('link', { name: 'Início' }).click();
    });

    expect(
      await screen.findByRole('link', { name: 'Abrir a página quebrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
