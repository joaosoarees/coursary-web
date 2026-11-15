import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

type SheetStoryArgs = React.ComponentProps<typeof Sheet> & {
  side: 'top' | 'right' | 'bottom' | 'left';
};

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  args: { onOpenChange: fn(), side: 'right' },
  argTypes: {
    defaultOpen: { control: false },
    open: { control: false },
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
  render: ({ side, ...args }) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Ver aulas</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Aulas do curso</SheetTitle>
          <SheetDescription>12 aulas em 3 módulos.</SheetDescription>
        </SheetHeader>
        <ol className="flex list-decimal flex-col gap-2 px-4 pl-9 text-sm">
          <li>Por que TypeScript</li>
          <li>Tipos básicos</li>
          <li>Funções</li>
        </ol>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  parameters: {
    docs: {
      story: { inline: false, height: '480px' },
      description: {
        component:
          'Um painel que entra por uma borda da tela, para conteúdo longo ao lado do que se está fazendo: a lista de aulas, o menu no celular. É um Dialog por baixo, com as mesmas regras: título e descrição sempre, foco preso, `Esc` fecha. `side` escolhe a borda (`right` por padrão).',
      },
    },
  },
} satisfies Meta<SheetStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const Left: Story = { args: { defaultOpen: true, side: 'left' } };

export const Bottom: Story = { args: { defaultOpen: true, side: 'bottom' } };
