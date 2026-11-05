import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TeachingGuard } from '~/auth/TeachingGuard';
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
        Component: TeachingGuard,
        children: [
          {
            path: '/instrutor/cursos',
            Component: () => <Landing title="Meus cursos" />,
          },
        ],
      },
      { path: '/cursos', Component: () => <Landing title="Catálogo" /> },
    ],
    '/instrutor/cursos',
  );

describe('the teaching guard', () => {
  it.each(['instructor', 'admin'] as const)(
    'should let an %s in',
    async (role) => {
      signedInAs(role);
      renderAt();

      expect(
        await screen.findByRole('heading', { name: 'Meus cursos' }),
      ).toBeVisible();
    },
  );

  it('should send a student to the catalog', async () => {
    signedInAs('student');
    renderAt();

    expect(
      await screen.findByRole('heading', { name: 'Catálogo' }),
    ).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Meus cursos' })).toBeNull();
  });
});
