import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ResetPassword from '~/routes/redefinir-senha';
import { AuthService } from '~/services/AuthService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const renderReset = () =>
  renderRoutes(
    [
      { path: '/redefinir-senha', Component: ResetPassword },
      { path: '/entrar', Component: () => <Landing title="Entrar" /> },
    ],
    { pathname: '/redefinir-senha', state: { email: 'ana@exemplo.com' } },
  );

const fill = (password: string) => {
  fireEvent.change(screen.getByLabelText('Código'), {
    target: { value: '482913' },
  });
  fireEvent.change(screen.getByLabelText('Senha nova'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar senha nova' }));
};

describe('the new password page', () => {
  it('should save the new password and go on to sign-in', async () => {
    const reset = vi.spyOn(AuthService, 'resetPassword').mockResolvedValue();
    renderReset();

    fill('violao2026');

    expect(
      await screen.findByRole('heading', { name: 'Entrar' }),
    ).toBeVisible();
    expect(screen.getByText('e-mail: ana@exemplo.com')).toBeVisible();
    expect(reset).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      code: '482913',
      newPassword: 'violao2026',
    });
  });

  it('should put a refused password under its field', async () => {
    vi.spyOn(AuthService, 'resetPassword').mockRejectedValue(
      apiError(400, 'INVALID_PASSWORD'),
    );
    renderReset();

    fill('violao2026');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '8 caracteres ou mais, com uma letra minúscula e um número.',
    );
    expect(screen.getByLabelText('Senha nova')).toHaveFocus();
  });
});
