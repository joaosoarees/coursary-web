import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import VisitorLayout, { ErrorBoundary } from '~/routes/visitor-layout';
import { endSession, startSession } from '~/session/session';
import { Landing, renderRoutes } from '~/test/renderRoutes';

vi.mock('~/theme/ThemeSwitcher', () => ({ ThemeSwitcher: () => null }));

function Broken(): React.ReactNode {
  throw new Error('render failed');
}

const renderAt = (path: string) =>
  renderRoutes(
    [
      {
        Component: VisitorLayout,
        ErrorBoundary: ErrorBoundary as never,
        children: [
          { path: '/entrar', Component: () => <h1>Entrar</h1> },
          { path: '/quebrada', Component: Broken },
        ],
      },
      { path: '/', Component: () => <Landing title="Início" /> },
    ],
    path,
  );

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  endSession();
});

describe('the visitor layout', () => {
  it('should show its page beside the board panel', () => {
    renderAt('/entrar');

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeVisible();
    expect(screen.getByRole('banner')).toHaveTextContent('Coursary');
  });

  it('should send a signed-in reader away from it', async () => {
    startSession('token-1');
    renderAt('/entrar');

    expect(
      await screen.findByRole('heading', { name: 'Início' }),
    ).toBeVisible();
  });

  it('should keep the board panel around a page that broke', async () => {
    renderAt('/quebrada');

    expect(
      await screen.findByRole('heading', { name: 'Algo deu errado' }),
    ).toBeVisible();
    expect(screen.getByRole('banner')).toHaveTextContent('Coursary');
  });
});
