import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChalkStroke } from './ChalkStroke';

const meta = {
  title: 'Components/ChalkStroke',
  component: ChalkStroke,
  args: { dashed: false, draw: false, className: 'w-60 text-foreground' },
  parameters: {
    docs: {
      description: {
        component:
          'O traço de giz, a assinatura do visual: um risco à mão com falhas, como giz pulando na lousa. Toma a cor do texto (`text-*` em `className`) e a largura do pai. `dashed` é o traço por fazer (o segmento aberto do progresso); `draw` desenha o risco uma vez, da esquerda para a direita, e fica parado com movimento reduzido. Decorativo: sempre `aria-hidden`.',
      },
    },
  },
} satisfies Meta<typeof ChalkStroke>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dashed: Story = {
  args: { dashed: true, className: 'w-60 text-input' },
};

export const Drawn: Story = {
  args: { draw: true, className: 'w-60 text-success' },
};

export const OnTheBoard: Story = {
  args: { className: 'w-40 text-chalk-yellow' },
  decorators: [
    (Story) => (
      <div className="rounded-lg bg-board p-6">
        <Story />
      </div>
    ),
  ],
};
