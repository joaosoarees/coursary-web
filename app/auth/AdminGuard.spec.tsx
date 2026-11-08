import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminGuard } from '~/auth/AdminGuard';
import { AccountService, type Profile } from '~/services/AccountService';
import { Landing, renderRoutes } from '~/test/renderRoutes';

const signedInAs = (role: Profile['role']) =>
  vi.spyOn(AccountService, 'getMe').mockResolvedValue({
    id: 'a1',
    name: 'Rafael Tavares',
    email: 'rafael@exemplo.com',
    role,
  });

const renderAt = () =>
  renderRoutes(
    [
      {
        Component: AdminGuard,
        children: [
          {
            path: '/admin/usuarios',
            Component: () => <Landing title="Usuários" />,
          },
        ],
      },
      { path: '/cursos', Component: () => <Landing title="Catálogo" /> },
    ],
    '/admin/usuarios',
  );

describe('the admin guard', () => {
  it('should let an admin in', async () => {
    signedInAs('admin');
    renderAt();

    expect(
      await screen.findByRole('heading', { name: 'Usuários' }),
    ).toBeVisible();
  });

  it.each(['student', 'instructor'] as const)(
    'should send %s to the catalog',
    async (role) => {
      signedInAs(role);
      renderAt();

      expect(
        await screen.findByRole('heading', { name: 'Catálogo' }),
      ).toBeVisible();
      expect(screen.queryByRole('heading', { name: 'Usuários' })).toBeNull();
    },
  );
});
