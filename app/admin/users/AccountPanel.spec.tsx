import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountPanel } from '~/admin/users/AccountPanel';
import { AccountService } from '~/services/AccountService';
import { type AccountSummary, AdminService } from '~/services/AdminService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const rafael: AccountSummary = {
  id: 'a1',
  name: 'Rafael Tavares',
  email: 'rafael@exemplo.com',
  role: 'instructor',
  status: 'ACTIVE',
  createdAt: '2026-10-12T12:00:00.000Z',
};

beforeAll(() => {
  // Radix Select measures and captures the pointer, which jsdom does not implement.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

beforeEach(() => {
  vi.spyOn(AccountService, 'getMe').mockResolvedValue({
    id: 'me',
    name: 'Marina Lopes',
    email: 'marina@exemplo.com',
    role: 'admin',
  });
  vi.spyOn(AdminService, 'roleChanges').mockResolvedValue({
    items: [
      {
        id: 'c2',
        fromRole: 'student',
        toRole: 'instructor',
        changedBy: 'me',
        changedAt: '2026-10-14T12:00:00.000Z',
      },
      {
        id: 'c1',
        fromRole: 'instructor',
        toRole: 'student',
        changedBy: 'bootstrap',
        changedAt: '2026-10-13T12:00:00.000Z',
      },
      {
        id: 'c0',
        fromRole: 'student',
        toRole: 'instructor',
        changedBy: 'other',
        changedAt: '2026-10-12T12:00:00.000Z',
      },
    ],
    nextCursor: null,
  });
});

function Opened({ account }: { account: AccountSummary }) {
  const [opened, setOpened] = useState<AccountSummary | null>(account);

  return (
    <AccountPanel
      account={opened}
      onClose={() => {
        setOpened(null);
      }}
      onChanged={setOpened}
    />
  );
}

function OpenedFromButton() {
  const [opened, setOpened] = useState<AccountSummary | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpened(rafael);
        }}
      >
        Rafael Tavares
      </button>
      <AccountPanel
        account={opened}
        onClose={() => {
          setOpened(null);
        }}
        onChanged={setOpened}
      />
    </>
  );
}

const renderPanel = (account: AccountSummary) =>
  renderRoutes(
    [
      {
        path: '/admin/usuarios',
        Component: () => <Opened account={account} />,
      },
    ],
    '/admin/usuarios',
  );

const panel = () => screen.getByRole('dialog', { name: 'Rafael Tavares' });

describe('AccountPanel', () => {
  it('should change the role after a confirmation that says what changes', async () => {
    const changeRole = vi
      .spyOn(AdminService, 'changeRole')
      .mockResolvedValue({ id: 'a1', role: 'student' });

    renderPanel(rafael);
    await screen.findByText('rafael@exemplo.com');

    fireEvent.keyDown(within(panel()).getByRole('combobox'), { key: 'Enter' });
    fireEvent.click(await screen.findByRole('option', { name: 'Aluno' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar papel' }));

    const confirm = await screen.findByRole('alertdialog', {
      name: 'Tornar Rafael Tavares aluno?',
    });

    expect(confirm).toHaveTextContent('Deixa de criar e editar cursos.');
    expect(confirm).toHaveTextContent('A mudança vale em até 1 hora');

    fireEvent.click(
      within(confirm).getByRole('button', { name: 'Tornar aluno' }),
    );

    expect(
      within(
        await screen.findByRole('dialog', { name: 'Rafael Tavares' }),
      ).getByText('Aluno', { selector: 'dd' }),
    ).toBeVisible();
    expect(changeRole).toHaveBeenCalledWith('a1', 'student');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Mudar o papel' }),
      ).toHaveFocus();
    });
  });

  it('should keep the save off until another role is chosen', async () => {
    renderPanel(rafael);
    await screen.findByText('rafael@exemplo.com');

    fireEvent.click(screen.getByRole('button', { name: 'Salvar papel' }));

    expect(screen.queryByRole('alertdialog', { name: /Tornar/ })).toBeNull();
  });

  it('should show a refusal inside the confirmation', async () => {
    vi.spyOn(AdminService, 'changeRole').mockRejectedValue(
      apiError(409, 'CONFLICT'),
    );
    renderPanel(rafael);
    await screen.findByText('rafael@exemplo.com');

    fireEvent.keyDown(within(panel()).getByRole('combobox'), { key: 'Enter' });
    fireEvent.click(await screen.findByRole('option', { name: 'Admin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar papel' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Tornar admin' }),
    );

    expect(
      await screen.findByText(/A conta mudou enquanto isso/),
    ).toBeVisible();
  });

  it('should show what the account is now when it changed elsewhere', async () => {
    vi.spyOn(AdminService, 'disable').mockRejectedValue(
      apiError(409, 'ACCOUNT_NOT_ACTIVE'),
    );
    vi.spyOn(AdminService, 'findByEmail').mockResolvedValue({
      ...rafael,
      status: 'DISABLED',
    });
    renderPanel(rafael);
    await screen.findByText('rafael@exemplo.com');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar conta' }));
    fireEvent.click(
      within(
        await screen.findByRole('alertdialog', {
          name: 'Desativar a conta de Rafael Tavares?',
        }),
      ).getByRole('button', { name: 'Desativar conta' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Reativar conta' }),
    ).toBeVisible();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('should disable the account, and then offer to reactivate it', async () => {
    const disable = vi
      .spyOn(AdminService, 'disable')
      .mockResolvedValue({ id: 'a1', status: 'DISABLED' });

    renderPanel(rafael);
    await screen.findByText('rafael@exemplo.com');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar conta' }));

    const confirm = await screen.findByRole('alertdialog', {
      name: 'Desativar a conta de Rafael Tavares?',
    });

    expect(confirm).toHaveTextContent('sai na hora de todas as sessões');

    fireEvent.click(
      within(confirm).getByRole('button', { name: 'Desativar conta' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Reativar conta' }),
    ).toBeVisible();
    expect(disable).toHaveBeenCalledWith('a1');
    expect(within(panel()).getByRole('combobox')).toBeDisabled();
  });

  it("should lock both changes on the admin's own account and say why", async () => {
    renderPanel({ ...rafael, id: 'me' });

    expect(
      await screen.findByText(
        'Esta é a sua conta. Outro admin precisa mudar o seu papel.',
      ),
    ).toBeVisible();
    expect(within(panel()).getByRole('combobox')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Desativar conta' }),
    ).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar conta' }));

    expect(
      screen.queryByRole('alertdialog', { name: /Desativar a conta/ }),
    ).toBeNull();
  });

  it('should give the focus back to the name that opened it', async () => {
    renderRoutes(
      [{ path: '/admin/usuarios', Component: OpenedFromButton }],
      '/admin/usuarios',
    );
    const name = await screen.findByRole('button', { name: 'Rafael Tavares' });

    name.focus();
    fireEvent.click(name);
    await screen.findByRole('dialog', { name: 'Rafael Tavares' });
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });

    await waitFor(() => {
      expect(name).toHaveFocus();
    });
  });

  it('should tell who made each role change', async () => {
    renderPanel(rafael);

    expect(await screen.findByText(/por você/)).toBeVisible();
    expect(screen.getByText(/pelo script inicial/)).toBeVisible();
    expect(screen.getByText(/por outro admin/)).toBeVisible();
  });
});
