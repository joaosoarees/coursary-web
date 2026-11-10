import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '~/auth/AuthProvider';
import { AccountFallback, AccountMenu } from '~/components/AccountMenu';
import { AccountService } from '~/services/AccountService';
import { AuthService } from '~/services/AuthService';
import { endSession, isSignedIn, startSession } from '~/session/session';

const renderMenu = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter>
          <AccountMenu />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );

beforeEach(() => {
  startSession('token-1');
  vi.spyOn(AccountService, 'getMe').mockResolvedValue({
    id: 'account-1',
    name: 'Ana Souza',
    email: 'ana@exemplo.com',
    role: 'student',
  });
});

afterEach(() => {
  endSession();
});

const open = async () => {
  const trigger = await screen.findByRole('button', { name: /Ana Souza/ });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
};

describe('AccountMenu', () => {
  it("should show the account's initials, name and e-mail, named for whose account it is", async () => {
    renderMenu();

    const trigger = await screen.findByRole('button', {
      name: 'Conta de Ana Souza',
    });

    expect(trigger).toHaveTextContent('AS');
    expect(trigger).toHaveAccessibleDescription('ana@exemplo.com');
  });

  it('should lead to the profile', async () => {
    renderMenu();

    await open();

    expect(
      await screen.findByRole('menuitem', { name: 'Perfil' }),
    ).toHaveAttribute('href', '/perfil');
  });

  it('should sign out from the menu', async () => {
    const signOut = vi.spyOn(AuthService, 'signOut').mockResolvedValue();
    renderMenu();

    await open();
    await act(async () => {
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Sair' }));
      await Promise.resolve();
    });

    expect(signOut).toHaveBeenCalled();
    expect(isSignedIn()).toBe(false);
  });
});

describe('AccountFallback', () => {
  const renderFallback = (compact: boolean) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <MemoryRouter>
            <AccountFallback compact={compact} />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

  it('should lead to the profile and sign out, named even without visible text', async () => {
    const signOut = vi.spyOn(AuthService, 'signOut').mockResolvedValue();
    renderFallback(true);

    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute(
      'href',
      '/perfil',
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
      await Promise.resolve();
    });

    expect(signOut).toHaveBeenCalled();
    expect(isSignedIn()).toBe(false);
  });
});
