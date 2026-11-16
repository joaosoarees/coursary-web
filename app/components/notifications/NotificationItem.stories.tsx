import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { withRouter } from '../../../.storybook/decorators';
import { notifications } from '../../../.storybook/fixtures';
import { NotificationItem } from './NotificationItem';

const [answer, lesson, question, archived, exportReady] = notifications;

const meta = {
  title: 'Components/Notifications/NotificationItem',
  component: NotificationItem,
  args: { notification: answer, now: new Date(), onOpen: fn() },
  argTypes: {
    notification: { control: false },
    now: { control: false },
  },
  decorators: [
    withRouter,
    (Story) => (
      <ul className="w-[400px] rounded-md border bg-popover p-1">
        <Story />
      </ul>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Um aviso no painel do sino: o ícone do tipo, a frase com os nomes em negrito, quanto tempo faz e, quando vem do instrutor, o selo. Não lido, fica em amarelo de giz com o ponto; lido, fica apagado. O aviso inteiro é o link para onde aconteceu (a pergunta na aula, a aula nova, a página de alunos com o CSV) e, ao abrir, marca como lido (`onOpen`).',
      },
    },
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Answer: Story = {};

export const NewLesson: Story = { args: { notification: lesson } };

export const Question: Story = { args: { notification: question } };

export const Archived: Story = { args: { notification: archived } };

export const ExportReady: Story = { args: { notification: exportReady } };
