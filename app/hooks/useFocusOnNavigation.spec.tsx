import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useFocusOnNavigation } from '~/hooks/useFocusOnNavigation';

function Shell() {
  const main = useFocusOnNavigation<HTMLElement>();

  return (
    <main ref={main} tabIndex={-1}>
      <Outlet />
    </main>
  );
}

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    [
      {
        Component: Shell,
        children: [
          { path: '/cursos', element: <p>catálogo</p> },
          { path: '/cursos/:id', element: <p>curso</p> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);

  return router;
};

describe('useFocusOnNavigation', () => {
  it('should leave focus alone on the first render', () => {
    renderAt('/cursos');

    expect(screen.getByRole('main')).not.toHaveFocus();
  });

  it('should move focus to the content after a navigation', async () => {
    const router = renderAt('/cursos');

    await act(() => router.navigate('/cursos/c1'));

    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('should move focus when only the search changes', async () => {
    const router = renderAt('/cursos?busca=dados');

    await act(() => router.navigate('/cursos?busca=dados&pagina=2'));

    expect(screen.getByRole('main')).toHaveFocus();
  });
});
