import type { Meta, StoryObj } from '@storybook/react-vite';

import { BoardMark, Wordmark } from './Wordmark';

const meta = {
  title: 'Components/Wordmark',
  component: Wordmark,
  decorators: [
    (Story) => (
      <div className="rounded-lg bg-shell px-6 py-5 text-shell-foreground">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A marca: a lousa com o traço de giz e o nome. Mora na lousa verde do shell, que dá a cor do contorno e do nome (`currentColor`); o giz amarelo é fixo. Na sidebar recolhida o nome some e fica a lousa. `BoardMark` é a lousa sozinha, para a sala de aula.',
      },
    },
  },
} satisfies Meta<typeof Wordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MarkOnly: Story = { render: () => <BoardMark size={40} /> };
