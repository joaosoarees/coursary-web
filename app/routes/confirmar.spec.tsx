import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ConfirmSignUp from '~/routes/confirmar';
import { AuthService } from '~/services/AuthService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const renderConfirm = (state?: unknown) =>
  renderRoutes(
    [
      { path: '/confirmar', Component: ConfirmSignUp },
      { path: '/entrar', Component: () => <Landing title="Entrar" /> },
    ],
    { pathname: '/confirmar', state },
  );

const submitCode = (code: string) => {
  fireEvent.change(screen.getByLabelText('Código'), {
    target: { value: code },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar e-mail' }));
};

describe('the confirmation page', () => {
  it('should confirm the e-mail it was given and go on to sign-in', async () => {
    const confirm = vi.spyOn(AuthService, 'confirmSignUp').mockResolvedValue();
    renderConfirm({ email: 'ana@exemplo.com' });

    expect(screen.queryByLabelText('E-mail')).toBeNull();
    submitCode('482913');

    expect(
      await screen.findByRole('heading', { name: 'Entrar' }),
    ).toBeVisible();
    expect(screen.getByText('e-mail: ana@exemplo.com')).toBeVisible();
    expect(confirm).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      code: '482913',
    });
  });

  it('should say when the code is wrong', async () => {
    vi.spyOn(AuthService, 'confirmSignUp').mockRejectedValue(
      apiError(400, 'INVALID_CODE'),
    );
    renderConfirm({ email: 'ana@exemplo.com' });

    submitCode('000000');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Código errado ou vencido. Confira o e-mail ou peça um código novo.',
    );
    expect(screen.getByLabelText('Código')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('should resend the code and then wait', async () => {
    const resend = vi
      .spyOn(AuthService, 'resendConfirmationCode')
      .mockResolvedValue();
    renderConfirm({ email: 'ana@exemplo.com' });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }));
      await Promise.resolve();
    });

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Mandamos um código novo para ana@exemplo.com.',
    );
    expect(screen.getByText('Reenviar em 1:00')).toBeVisible();
    expect(resend).toHaveBeenCalledWith('ana@exemplo.com');
  });

  it('should ask for the e-mail when it opens without one', async () => {
    const resend = vi.spyOn(AuthService, 'resendConfirmationCode');
    renderConfirm();

    fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }));

    expect(await screen.findByText('Informe o e-mail.')).toBeVisible();
    expect(resend).not.toHaveBeenCalled();
  });
});
