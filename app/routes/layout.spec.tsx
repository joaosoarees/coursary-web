import { act, render, screen } from '@testing-library/react';
import { createRoutesStub, Link } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Layout, { ErrorBoundary } from '~/routes/layout';
import NotFound, { clientLoader as notFoundLoader } from '~/routes/not-found';
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
        index: true,
        Component: () => <Link to="/quebrada">Abrir a página quebrada</Link>,
      },
      { path: 'quebrada', Component: Broken },
      { path: 'instavel', Component: Flaky },
      { path: '*', loader: notFoundLoader, Component: NotFound },
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
  flakyFails = true;
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
