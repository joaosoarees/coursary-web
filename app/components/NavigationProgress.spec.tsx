import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub, Link, Outlet } from 'react-router';
import { describe, expect, it } from 'vitest';

import { NavigationProgress } from '~/components/NavigationProgress';

const renderWithSlowPage = () => {
  const { promise: loaded, resolve } = Promise.withResolvers<null>();
  const finish = () => {
    resolve(null);
  };
  const Stub = createRoutesStub([
    {
      path: '/',
      Component: () => (
        <>
          <NavigationProgress />
          <Outlet />
        </>
      ),
      children: [
        { index: true, Component: () => <Link to="/lenta">Abrir</Link> },
        {
          path: 'lenta',
          loader: () => loaded,
          Component: () => <h1>Página lenta</h1>,
        },
      ],
    },
  ]);
  render(<Stub initialEntries={['/']} />);

  return { finish };
};

describe('NavigationProgress', () => {
  it('should show a bar only while a slow navigation is pending', async () => {
    const { finish } = renderWithSlowPage();

    fireEvent.click(await screen.findByRole('link', { name: 'Abrir' }));

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(
      await screen.findByRole('progressbar', { name: 'Carregando a página' }),
    ).toBeInTheDocument();

    finish();

    expect(
      await screen.findByRole('heading', { name: 'Página lenta' }),
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
  });
});
