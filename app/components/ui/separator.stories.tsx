import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from './separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  args: { orientation: 'horizontal', decorative: true },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Uma linha entre grupos. Por padrão é decorativa e o leitor de tela a ignora; com `decorative={false}`, anuncia uma separação de conteúdo.',
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-3">
      <p>Aulas</p>
      <Separator {...args} />
      <p>Material</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-6 items-center gap-3">
      <span>12 aulas</span>
      <Separator {...args} />
      <span>Iniciante</span>
    </div>
  ),
  args: { orientation: 'vertical' },
};
