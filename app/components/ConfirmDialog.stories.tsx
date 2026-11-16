import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { ConfirmDialog } from './ConfirmDialog';
import { Button } from './ui/button';

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: false,
    onClose: fn(),
    onReset: fn(),
    onConfirm: fn(),
    pending: false,
    error: null,
    title: 'Arquivar o curso?',
    description:
      'TypeScript do zero sai do catálogo e ninguém novo se matricula.',
    consequence: 'Quem já está matriculado continua assistindo.',
    confirm: { label: 'Arquivar', pending: 'Arquivando…' },
  },
  argTypes: {
    open: { control: false },
    description: { control: 'text' },
  },
  // The dialog is controlled: held here, Cancelar and Esc close it as they do in the app.
  render: function Render({ open: initiallyOpen, onClose, ...args }) {
    const [open, setOpen] = useState(initiallyOpen);

    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            setOpen(true);
          }}
        >
          {args.confirm.label} curso
        </Button>
        <ConfirmDialog
          {...args}
          open={open}
          onClose={() => {
            setOpen(false);
            onClose();
          }}
        />
      </>
    );
  },
  parameters: {
    docs: {
      story: { inline: false, height: '360px' },
      description: {
        component:
          'Confirma uma ação que muda muito ou não se desfaz, antes de fazê-la. É um `alertdialog` sem o X: sai por Cancelar ou `Esc`. Enquanto o pedido corre, nada fecha e os botões ficam desligados; se a API recusa, o erro aparece dentro, e a pessoa decide de novo. Com `confirm.destructive`, o botão fica vermelho. Quem usa controla o `open`.',
      },
    },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { open: true } };

export const Destructive: Story = {
  args: {
    open: true,
    title: 'Apagar o curso?',
    description: 'TypeScript do zero e as 12 aulas dele somem para sempre.',
    consequence: 'Os 48 alunos perdem o acesso e o progresso.',
    confirm: { label: 'Apagar', pending: 'Apagando…', destructive: true },
  },
};

export const Pending: Story = { args: { open: true, pending: true } };

export const Refused: Story = {
  args: {
    open: true,
    error: 'Não deu para arquivar o curso agora. Tente de novo.',
  },
};
