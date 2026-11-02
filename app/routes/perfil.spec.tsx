import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProfilePage from '~/routes/perfil';
import { AccountService } from '~/services/AccountService';

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ProfilePage />
    </QueryClientProvider>,
  );

describe('the profile page', () => {
  it('should show the photo and the details of the account', async () => {
    vi.spyOn(AccountService, 'getMe').mockResolvedValue({
      id: 'a1',
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      role: 'student',
    });
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Foto' })).toBeVisible();
    expect(screen.getByText('AS')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Trocar foto' })).toBeEnabled();
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza');
    expect(screen.getByText('Aluno')).toBeVisible();
  });

  it('should offer a retry when the account cannot be read', async () => {
    vi.spyOn(AccountService, 'getMe').mockRejectedValue(new Error('500'));
    renderPage();

    expect(
      await screen.findByRole('button', { name: 'Tentar de novo' }),
    ).toBeVisible();
  });
});
