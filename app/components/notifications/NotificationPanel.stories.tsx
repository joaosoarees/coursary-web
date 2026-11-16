import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { useNotifications } from '~/queries/notifications';

import { withApi, withRouter } from '../../../.storybook/decorators';
import { notifications } from '../../../.storybook/fixtures';
import { NotificationPanel } from './NotificationPanel';

const page = (nextCursor: string | null = null) => ({
  body: { items: notifications, nextCursor, unreadCount: 2 },
});

const marking = {
  'POST /me/notifications/n-1/read': {},
  'POST /me/notifications/n-2/read': {},
  'POST /me/notifications/read-all': { body: { marked: 2 } },
};

// The panel reads the inbox query itself here, as the bell hands it in the app.
type PanelStoryArgs = Pick<
  React.ComponentProps<typeof NotificationPanel>,
  'onNavigate'
>;

const meta = {
  title: 'Components/Notifications/NotificationPanel',
  args: { onNavigate: fn() },
  render: function Render({ onNavigate }) {
    const inbox = useNotifications();

    return (
      <div className="w-[400px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        <NotificationPanel
          inbox={inbox}
          unreadCount={inbox.data?.pages[0]?.unreadCount ?? 0}
          onNavigate={onNavigate}
        />
      </div>
    );
  },
  decorators: [withRouter, withApi],
  parameters: {
    api: { 'GET /me/notifications': page(), ...marking },
    docs: {
      story: { inline: false, height: '600px' },
      description: {
        component:
          'O que o sino abre: a caixa de avisos, os mais novos em cima, com "Marcar todas como lidas" enquanto houver não lidas. Abrir um aviso marca só ele. A lista pagina pelo botão no pé, sem rolagem infinita, para não puxar páginas sozinha num painel pequeno. Tem estado para carregando, para a caixa vazia e para a falha, com "Tentar de novo".',
      },
    },
  },
} satisfies Meta<PanelStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inbox: Story = {};

export const MoreToLoad: Story = {
  parameters: {
    api: { 'GET /me/notifications': page('next'), ...marking },
  },
};

export const Empty: Story = {
  parameters: {
    api: {
      'GET /me/notifications': {
        body: { items: [], nextCursor: null, unreadCount: 0 },
      },
    },
  },
};

export const Loading: Story = {
  parameters: { api: { 'GET /me/notifications': 'pending' } },
};

export const Failed: Story = {
  parameters: { api: { 'GET /me/notifications': { status: 500 } } },
};
