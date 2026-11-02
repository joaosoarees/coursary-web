import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileForm } from '~/account/ProfileForm';
import { meQuery } from '~/queries/me';
import { AccountService, type Profile } from '~/services/AccountService';

const profile: Profile = {
  id: 'a1',
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  role: 'instructor',
};

const renderForm = (queryClient = new QueryClient()) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ProfileForm profile={profile} />
    </QueryClientProvider>,
  );

describe('ProfileForm', () => {
  it('should show the e-mail and the role, and save only a changed name', async () => {
    const queryClient = new QueryClient();
    const updateMe = vi
      .spyOn(AccountService, 'updateMe')
      .mockResolvedValue({ ...profile, name: 'Ana Lima' });
    renderForm(queryClient);

    expect(screen.getByText('ana@exemplo.com')).toBeVisible();
    expect(screen.getByText('Instrutor')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: '  Ana Lima ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByRole('button', { name: 'Salvar' }),
    ).toBeDisabled();
    expect(updateMe).toHaveBeenCalledWith('Ana Lima');
    expect(queryClient.getQueryData(meQuery.queryKey)).toMatchObject({
      name: 'Ana Lima',
    });
  });

  it('should refuse an empty name', async () => {
    const updateMe = vi.spyOn(AccountService, 'updateMe');
    renderForm();

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: ' ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o seu nome.')).toBeVisible();
    expect(updateMe).not.toHaveBeenCalled();
  });
});
