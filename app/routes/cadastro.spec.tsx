import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SignUp from '~/routes/cadastro';
import { AuthService } from '~/services/AuthService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const renderSignUp = () =>
  renderRoutes(
    [
      { path: '/cadastro', Component: SignUp },
      { path: '/confirmar', Component: () => <Landing title="Confirmar" /> },
    ],
    '/cadastro',
  );

const fill = (password: string) => {
  fireEvent.change(screen.getByLabelText('Nome'), {
    target: { value: 'Ana Souza' },
  });
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: 'ana@exemplo.com' },
  });
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
};

describe('the sign-up page', () => {
  it('should create the account and go on to the confirmation', async () => {
    const signUp = vi.spyOn(AuthService, 'signUp').mockResolvedValue();
    renderSignUp();

    fill('violao2026');

    expect(
      await screen.findByRole('heading', { name: 'Confirmar' }),
    ).toBeVisible();
    expect(screen.getByText('e-mail: ana@exemplo.com')).toBeVisible();
    expect(signUp).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      password: 'violao2026',
    });
  });

  it('should show the password rule and send nothing for a weak password', async () => {
    const signUp = vi.spyOn(AuthService, 'signUp');
    renderSignUp();

    fill('violao');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '8 caracteres ou mais, com uma letra minúscula e um número.',
    );
    expect(screen.getByLabelText('Senha')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it('should offer sign-in and recovery for an e-mail already registered', async () => {
    vi.spyOn(AuthService, 'signUp').mockRejectedValue(
      apiError(409, 'EMAIL_IN_USE'),
    );
    renderSignUp();

    fill('violao2026');

    expect(
      await screen.findByText(/Já existe uma conta com este e-mail\./),
    ).toBeVisible();
    expect(screen.getByLabelText('E-mail')).toHaveFocus();
    expect(
      screen.getByRole('link', { name: 'recuperar a senha' }),
    ).toBeVisible();
  });
});
