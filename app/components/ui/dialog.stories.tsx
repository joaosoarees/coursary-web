import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  args: { onOpenChange: fn() },
  argTypes: {
    defaultOpen: { control: false },
    open: { control: false },
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="destructive-outline">Arquivar curso</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arquivar Introdução ao TypeScript?</DialogTitle>
          <DialogDescription>
            O curso sai do catálogo. Os 128 alunos matriculados continuam com
            acesso.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive">Arquivar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'Uma janela que pede uma decisão antes de seguir, sobre o resto da tela. Sempre com `DialogTitle` e `DialogDescription`, que o leitor de tela anuncia ao abrir. O foco fica preso dentro dela e volta ao gatilho quando fecha; `Esc` e o X fecham. Para um painel lateral, use Sheet.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const WithFooterClose: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Como funciona o CSV</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>CSV dos alunos</DialogTitle>
          <DialogDescription>
            O arquivo fica pronto em alguns minutos e o link chega pelo sino.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
  args: { defaultOpen: true },
  parameters: {
    docs: {
      description: {
        story:
          'Sem o X do canto (`showCloseButton={false}`), com o botão Fechar no rodapé (`DialogFooter showCloseButton`).',
      },
    },
  },
};
