import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { fn } from 'storybook/test';

import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Salvar curso', onClick: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'outline',
        'ghost',
        'destructive',
        'destructive-outline',
        'link',
      ],
    },
    size: { control: 'inline-radio', options: ['default', 'sm', 'icon'] },
    disabled: { control: 'boolean' },
    asChild: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Dispara uma ação. `default` é a ação principal da tela, uma por vez; `secondary` e `outline` as ações ao lado dela; `ghost` e `link` as discretas, dentro de listas e menus; `destructive` confirma o que não se desfaz e `destructive-outline` abre essa confirmação. Sem `type`, é `button`, nunca envia um formulário por engano. Com `asChild`, o estilo vai para o filho, como um link.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Outline: Story = { args: { variant: 'outline' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Apagar curso' },
};

export const DestructiveOutline: Story = {
  args: { variant: 'destructive-outline', children: 'Arquivar curso' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Ver todos os cursos' },
};

export const Small: Story = { args: { size: 'sm' } };

export const Disabled: Story = { args: { disabled: true } };

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <PlusIcon aria-hidden="true" />
      {args.children}
    </Button>
  ),
  args: { children: 'Nova aula' },
};

export const Icon: Story = {
  render: (args) => (
    <Button {...args}>
      <Trash2Icon aria-hidden="true" />
    </Button>
  ),
  args: { size: 'icon', variant: 'ghost', 'aria-label': 'Apagar aula' },
  parameters: {
    docs: {
      description: {
        story:
          'Só o ícone: o `aria-label` é o nome do botão para quem usa leitor de tela.',
      },
    },
  },
};

export const AsChild: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#catalogo">{args.children}</a>
    </Button>
  ),
  args: { variant: 'outline', children: 'Ir para o catálogo' },
};
