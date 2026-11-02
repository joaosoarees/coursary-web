import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SignIn from '~/routes/entrar';
import VisitorLayout from '~/routes/visitor-layout';
import { AuthService } from '~/services/AuthService';
import { endSession, getAccessToken } from '~/session/session';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

vi.mock('~/theme/ThemeSwitcher', () => ({ ThemeSwitcher: () => null }));

afterEach(() => {
  endSession();
});

const renderSignIn = (state?: unknown) =>
  renderRoutes(
    [
      {
        Component: VisitorLayout,
        children: [{ path: '/entrar', Component: SignIn }],
      },
      { path: '/', Component: () => <Landing title="Início" /> },
      { path: '/confirmar', Component: () => <Landing title="Confirmar" /> },
    ],
    { pathname: '/entrar', state },
  );

const fill = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
};

describe('the sign-in page', () => {
  it('should sign in and leave for where the reader was going', async () => {
    const signIn = vi
      .spyOn(AuthService, 'signIn')
      .mockResolvedValue({ accessToken: 'token-1', expiresIn: 3600 });
    renderSignIn();

    fill(' ana@exemplo.com ', 'violao2026');

    expect(
      await screen.findByRole('heading', { name: 'Início' }),
    ).toBeVisible();
    expect(signIn).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      password: 'violao2026',
    });
    expect(getAccessToken()).toBe('token-1');
  });

  it('should send nothing while a field is empty', async () => {
    const signIn = vi.spyOn(AuthService, 'signIn');
    renderSignIn();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe o e-mail.')).toBeVisible();
    expect(screen.getByText('Informe a senha.')).toBeVisible();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('should say when the e-mail or the password is wrong', async () => {
    vi.spyOn(AuthService, 'signIn').mockRejectedValue(
      apiError(401, 'INVALID_CREDENTIALS'),
    );
    renderSignIn();

    fill('ana@exemplo.com', 'errada');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha incorretos. Confira e tente de novo.',
    );
  });

  it('should point an unconfirmed account to the confirmation', async () => {
    vi.spyOn(AuthService, 'signIn').mockRejectedValue(
      apiError(403, 'EMAIL_NOT_CONFIRMED'),
    );
    renderSignIn();

    fill('ana@exemplo.com', 'violao2026');
    fireEvent.click(
      await screen.findByRole('link', { name: 'Confirmar e-mail' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Confirmar' }),
    ).toBeVisible();
    expect(screen.getByText('e-mail: ana@exemplo.com')).toBeVisible();
  });

  it('should fill in the e-mail another page passed on', () => {
    renderSignIn({ email: 'ana@exemplo.com' });

    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@exemplo.com');
  });
});
