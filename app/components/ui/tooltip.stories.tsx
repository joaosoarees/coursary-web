import type { Meta, StoryObj } from '@storybook/react-vite';
import { Trash2Icon } from 'lucide-react';
import { fn } from 'storybook/test';

import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

type TooltipStoryArgs = React.ComponentProps<typeof Tooltip> & {
  side: 'top' | 'right' | 'bottom' | 'left';
};

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  args: { onOpenChange: fn(), side: 'top' },
  argTypes: {
    defaultOpen: { control: false },
    open: { control: false },
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  render: ({ side, ...args }) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Apagar aula">
          <Trash2Icon aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>Apagar aula</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      story: { inline: false, height: '200px' },
      description: {
        component:
          'Uma dica curta que aparece no hover e no foco, quase sempre o nome de um botão só de ícone. Não substitui o `aria-label`: o leitor de tela lê o nome do botão, e no toque a dica não aparece. Nada clicável dentro dela; para isso, use Popover. Precisa de um `TooltipProvider` acima (o shell e a sidebar já têm).',
      },
    },
  },
} satisfies Meta<TooltipStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const Right: Story = { args: { defaultOpen: true, side: 'right' } };
