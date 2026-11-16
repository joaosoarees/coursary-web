import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccountStatusBadge } from './AccountStatusBadge';

const meta = {
  title: 'Components/Admin/AccountStatusBadge',
  component: AccountStatusBadge,
  args: { status: 'ACTIVE' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['ACTIVE', 'PENDING', 'DISABLED'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'O estado de uma conta na área de admin: ativa, pendente (o e-mail ainda não foi confirmado) ou desativada. O ponto e a palavra dizem o estado; a cor só repete.',
      },
    },
  },
} satisfies Meta<typeof AccountStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Pending: Story = { args: { status: 'PENDING' } };

export const Disabled: Story = { args: { status: 'DISABLED' } };
