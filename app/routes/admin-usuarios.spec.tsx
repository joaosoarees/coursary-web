import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import AdminUsersPage from '~/routes/admin-usuarios';
import {
  type AccountsPage,
  type AccountSummary,
  AdminService,
} from '~/services/AdminService';
import { renderRoutes } from '~/test/renderRoutes';

const account = (
  n: number,
  overrides: Partial<AccountSummary> = {},
): AccountSummary => ({
  id: `a${String(n)}`,
  name: `Pessoa ${String(n)}`,
  email: `pessoa${String(n)}@exemplo.com`,
  role: 'student',
  status: 'ACTIVE',
  createdAt: '2026-11-06T12:00:00.000Z',
  ...overrides,
});

const firstPage = Array.from({ length: 20 }, (_, i) => account(i + 1));

let list: MockInstance<typeof AdminService.list>;

beforeAll(() => {
  // Radix Select measures and captures the pointer, which jsdom does not implement.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

beforeEach(() => {
  list = vi
    .spyOn(AdminService, 'list')
    .mockImplementation(({ role, status, cursor }) =>
      Promise.resolve(
        status === 'DISABLED'
          ? { items: [], nextCursor: null }
          : role === 'instructor'
            ? {
                items: [account(90, { name: 'Rafael Tavares', role })],
                nextCursor: null,
              }
            : cursor
              ? {
                  items: [account(21, { status: 'PENDING' })],
                  nextCursor: null,
                }
              : { items: firstPage, nextCursor: 'n2' },
      ),
    );
});

const renderPage = (search = '') =>
  renderRoutes(
    [{ path: '/admin/usuarios', Component: AdminUsersPage }],
    `/admin/usuarios${search}`,
  );

describe('admin users', () => {
  it('should list the newest students first and page to the next ones', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Usuários' }),
    ).toBeVisible();
    expect(await screen.findByText('Pessoa 1')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Alunos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByText('Mostrando 1–20, mais recentes primeiro'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(await screen.findByText('Pessoa 21')).toBeVisible();
    expect(screen.getByText('Pendente')).toBeVisible();
    expect(screen.getByText('Página 2')).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      { role: 'student', status: undefined, cursor: 'n2', limit: 20 },
      expect.anything(),
    );
  });

  it('should start another role from its first page', async () => {
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Próxima página' }),
    );
    await screen.findByText('Pessoa 21');

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Instrutores' }));

    expect(await screen.findByText('Rafael Tavares')).toBeVisible();
    expect(screen.getByText('1 conta')).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      { role: 'instructor', status: undefined, cursor: undefined, limit: 20 },
      expect.anything(),
    );
  });

  it('should open on the role and status in the address', async () => {
    renderPage('?papel=instrutores&status=pendentes');

    expect(await screen.findByText('Rafael Tavares')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Instrutores' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(list).toHaveBeenLastCalledWith(
      { role: 'instructor', status: 'PENDING', cursor: undefined, limit: 20 },
      expect.anything(),
    );
  });

  it('should say when no account has the chosen status, and show all again', async () => {
    renderPage();
    await screen.findByText('Pessoa 1');

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Status' }), {
      key: 'Enter',
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Desativadas' }));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma conta aqui' }),
    ).toBeVisible();
    expect(
      screen.getByText('Nenhuma conta desativada entre os alunos.'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar todas' }));

    expect(await screen.findByText('Pessoa 1')).toBeVisible();
  });

  it("should not show another status's accounts while the new ones load", async () => {
    renderPage();
    await screen.findByText('Pessoa 1');
    const disabled = Promise.withResolvers<AccountsPage>();

    list.mockReturnValueOnce(disabled.promise);
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Status' }), {
      key: 'Enter',
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Desativadas' }));

    expect(
      await screen.findByText('Carregando as contas…'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Pessoa 1')).toBeNull();

    disabled.resolve({ items: [], nextCursor: null });

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma conta aqui' }),
    ).toBeVisible();
  });

  it('should find an account by its e-mail and go back to the same page of the list', async () => {
    vi.spyOn(AdminService, 'findByEmail').mockImplementation((email) =>
      Promise.resolve(
        email === 'bia@exemplo.com'
          ? account(7, { name: 'Beatriz Nakamura', email, role: 'instructor' })
          : null,
      ),
    );
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Próxima página' }),
    );
    await screen.findByText('Pessoa 21');

    const field = screen.getByRole('textbox', { name: 'Buscar por e-mail' });

    fireEvent.change(field, { target: { value: 'bia@exemplo.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Beatriz Nakamura')).toBeVisible();
    expect(screen.getByText('1 conta com esse e-mail')).toBeVisible();
    expect(screen.getByText('Instrutor')).toBeVisible();

    fireEvent.change(field, { target: { value: 'ninguem@exemplo.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Nenhuma conta com esse e-mail',
      }),
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Busca por ninguem@exemplo.com: nenhuma conta encontrada',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));

    expect(await screen.findByText('Pessoa 21')).toBeVisible();
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Buscar por e-mail' }),
      ).toHaveFocus();
    });
    expect(
      screen.getByRole('textbox', { name: 'Buscar por e-mail' }),
    ).toHaveValue('');
  });

  it('should not search an incomplete e-mail', async () => {
    const findByEmail = vi.spyOn(AdminService, 'findByEmail');

    renderPage();
    fireEvent.change(
      await screen.findByRole('textbox', { name: 'Buscar por e-mail' }),
      { target: { value: 'bia@' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByText(
        'Informe um e-mail completo, como nome@exemplo.com.',
      ),
    ).toBeVisible();
    expect(findByEmail).not.toHaveBeenCalled();
  });
});
