import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ForgotPassword from '~/routes/recuperar-senha';
import { AuthService } from '~/services/AuthService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const renderForgot = (state?: unknown) =>
  renderRoutes(
    [
      { path: '/recuperar-senha', Component: ForgotPassword },
      {
        path: '/redefinir-senha',
        Component: () => <Landing title="Senha nova" />,
      },
    ],
    { pathname: '/recuperar-senha', state },
  );

describe('the password recovery page', () => {
  it('should send the code and go on with the e-mail', async () => {
    const forgot = vi.spyOn(AuthService, 'forgotPassword').mockResolvedValue();
    renderForgot({ email: 'ana@exemplo.com' });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));

    expect(
      await screen.findByRole('heading', { name: 'Senha nova' }),
    ).toBeVisible();
    expect(screen.getByText('e-mail: ana@exemplo.com')).toBeVisible();
    expect(forgot).toHaveBeenCalledWith('ana@exemplo.com');
  });

  it('should ask to wait after too many requests', async () => {
    vi.spyOn(AuthService, 'forgotPassword').mockRejectedValue(
      apiError(429, 'TOO_MANY_REQUESTS'),
    );
    renderForgot({ email: 'ana@exemplo.com' });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas tentativas seguidas. Espere alguns minutos e peça o código de novo.',
    );
  });
});
