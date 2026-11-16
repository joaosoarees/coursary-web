import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '~/lib/utils';

import { withApi, withRouter } from '../../../.storybook/decorators';
import { notifications } from '../../../.storybook/fixtures';
import { NotificationBell } from './NotificationBell';

const inbox = (unreadCount: number) => ({
  'GET /me/notifications': {
    body: { items: notifications, nextCursor: null, unreadCount },
  },
  'POST /me/notifications/n-1/read': {},
  'POST /me/notifications/n-2/read': {},
  'POST /me/notifications/read-all': { body: { marked: unreadCount } },
});

const meta = {
  title: 'Components/Notifications/NotificationBell',
  component: NotificationBell,
  args: { tone: 'header' },
  argTypes: { tone: { control: 'inline-radio', options: ['header', 'shell'] } },
  // Under md the header sits on the shell, as `shell` always does; the bell is drawn for that green.
  decorators: [
    (Story, { args }) => (
      <div
        className={cn(
          'flex justify-end rounded-lg bg-shell p-2',
          args.tone !== 'shell' && 'md:bg-transparent',
        )}
      >
        <Story />
      </div>
    ),
    withRouter,
    withApi,
  ],
  parameters: {
    layout: 'padded',
    api: inbox(2),
    docs: {
      story: { inline: false, height: '640px' },
      description: {
        component:
          'O sino das notificações, no topo dos dois shells. O número mostra as não lidas, até "99+", e o nome do botão diz o mesmo ao leitor de tela. Abre o painel com a caixa (veja NotificationPanel). `tone` acompanha onde ele fica: `header` está no shell no celular e na página do md para cima; `shell` fica sempre na lousa.',
      },
    },
  },
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};

export const AllRead: Story = { parameters: { api: inbox(0) } };

export const OverNinetyNine: Story = { parameters: { api: inbox(140) } };

export const OnTheShell: Story = { args: { tone: 'shell' } };
