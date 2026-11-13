import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Outlet } from 'react-router';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { NotificationBell } from '~/components/notifications/NotificationBell';
import {
  type Notification,
  NotificationService,
  type NotificationsPage,
} from '~/services/NotificationService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const answer: Notification = {
  id: 'n1',
  kind: 'answer',
  courseId: 'c1',
  courseTitle: 'Python para análise de dados',
  lessonId: 'l1',
  lessonTitle: 'Filtrando e agrupando',
  questionId: 'q1',
  actorName: 'Marina Costa',
  byInstructor: true,
  read: false,
  createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
};
const archived: Notification = {
  id: 'n2',
  kind: 'archived',
  courseId: 'c2',
  courseTitle: 'SQL do zero',
  byInstructor: false,
  read: true,
  createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
};

const page = (
  items: Notification[],
  unreadCount: number,
  nextCursor: string | null = null,
): NotificationsPage => ({ items, nextCursor, unreadCount });

let list: MockInstance<typeof NotificationService.list>;
let markRead: MockInstance<typeof NotificationService.markRead>;
let markAllRead: MockInstance<typeof NotificationService.markAllRead>;

beforeEach(() => {
  vi.restoreAllMocks();
  list = vi
    .spyOn(NotificationService, 'list')
    .mockResolvedValue(page([answer, archived], 1));
  markRead = vi.spyOn(NotificationService, 'markRead').mockResolvedValue();
  markAllRead = vi
    .spyOn(NotificationService, 'markAllRead')
    .mockResolvedValue(1);
});

// The bell lives in the shell, which stays while the page under it changes.
const renderBell = () =>
  renderRoutes(
    [
      {
        Component: () => (
          <>
            <NotificationBell />
            <Outlet />
          </>
        ),
        children: [
          { path: '/', Component: () => <Landing title="Início" /> },
          {
            path: '/cursos/:id/aulas/:aulaId',
            Component: () => <Landing title="Aula" />,
          },
          {
            path: '/minhas-matriculas',
            Component: () => <Landing title="Minhas matrículas" />,
          },
        ],
      },
    ],
    '/',
  );

const openPanel = async () => {
  fireEvent.click(
    await screen.findByRole('button', { name: 'Notificações, 1 não lida' }),
  );

  return screen.findByRole('region', { name: 'Notificações' });
};

describe('NotificationBell', () => {
  it('should say how many are unread, and show 99+ past it', async () => {
    list.mockResolvedValue(page([answer], 100));
    renderBell();

    const bell = await screen.findByRole('button', {
      name: 'Notificações, mais de 99 não lidas',
    });
    expect(bell).toHaveTextContent('99+');
  });

  it('should show no count when nothing is unread', async () => {
    list.mockResolvedValue(page([archived], 0));
    renderBell();

    await waitFor(() => {
      expect(list).toHaveBeenCalled();
    });
    expect(
      await screen.findByRole('button', { name: 'Notificações' }),
    ).toHaveTextContent('');
  });

  it('should open on the title, with the unread one announced first', async () => {
    renderBell();
    const panel = await openPanel();

    expect(
      within(panel).getByRole('heading', { name: 'Notificações' }),
    ).toHaveFocus();
    const links = within(panel).getAllByRole('link');
    // jsdom joins inline runs without the spaces a browser keeps: only the order is checked here.
    expect(links[0]).toHaveAccessibleName(
      /^Não lida:\s*Marina Costa respondeu à sua pergunta em\s*Filtrando e agrupando\s*do instrutor\s*há 5 minutos$/,
    );
    expect(links[1]).toHaveAccessibleName(/^SQL do zero\s*foi arquivado/);
    expect(markRead).not.toHaveBeenCalled();
  });

  it('should mark an unread one read, close and go to its lesson', async () => {
    renderBell();
    const panel = await openPanel();

    fireEvent.click(within(panel).getByRole('link', { name: /Marina Costa/ }));

    expect(await screen.findByRole('heading', { name: 'Aula' })).toBeVisible();
    expect(markRead).toHaveBeenCalledWith('n1');
    expect(
      screen.queryByRole('region', { name: 'Notificações' }),
    ).not.toBeInTheDocument();
  });

  it('should go without marking one already read', async () => {
    renderBell();
    const panel = await openPanel();

    fireEvent.click(within(panel).getByRole('link', { name: /SQL do zero/ }));

    expect(
      await screen.findByRole('heading', { name: 'Minhas matrículas' }),
    ).toBeVisible();
    expect(markRead).not.toHaveBeenCalled();
  });

  it('should mark all read and say so', async () => {
    renderBell();
    const panel = await openPanel();
    list.mockResolvedValue(page([{ ...answer, read: true }, archived], 0));

    fireEvent.click(
      within(panel).getByRole('button', { name: 'Marcar todas como lidas' }),
    );

    await waitFor(() => {
      expect(markAllRead).toHaveBeenCalled();
    });
    expect(
      await within(panel).findByText(
        'Todas as notificações foram marcadas como lidas.',
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Notificações' }),
    ).toBeInTheDocument();
  });

  it('should load the next page on demand', async () => {
    list
      .mockResolvedValueOnce(page([answer], 1, 'next'))
      .mockResolvedValueOnce(page([archived], 1));
    renderBell();
    const panel = await openPanel();

    fireEvent.click(
      within(panel).getByRole('button', { name: 'Carregar mais' }),
    );

    expect(
      await within(panel).findByRole('link', { name: /SQL do zero/ }),
    ).toBeInTheDocument();
    expect(list).toHaveBeenLastCalledWith(
      { cursor: 'next', limit: 20 },
      expect.anything(),
    );
  });

  it('should invite nothing but explain an empty inbox', async () => {
    list.mockResolvedValue(page([], 0));
    renderBell();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Notificações' }),
    );

    expect(await screen.findByText('Nenhuma notificação')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Marcar todas como lidas' }),
    ).not.toBeInTheDocument();
  });

  it('should offer to try again when the list does not load', async () => {
    list
      .mockRejectedValueOnce(apiError(403, 'FORBIDDEN'))
      .mockResolvedValue(page([answer], 1));
    renderBell();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Notificações' }),
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('As notificações não carregaram.');

    fireEvent.click(
      within(alert).getByRole('button', { name: 'Tentar de novo' }),
    );

    expect(
      await screen.findByRole('link', { name: /Marina Costa/ }),
    ).toBeInTheDocument();
  });
});
