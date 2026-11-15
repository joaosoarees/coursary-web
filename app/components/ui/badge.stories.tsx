import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Publicado' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ],
    },
    asChild: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Um rótulo curto ao lado de um título: o estado de um curso, o papel de uma conta, um nível. Não é botão; com `asChild` sobre um link, ganha o hover.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Rascunho' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Desativada' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Iniciante' },
};

export const Ghost: Story = { args: { variant: 'ghost', children: 'Aluno' } };

export const AsLink: Story = {
  render: (args) => (
    <Badge {...args} asChild>
      <a href="#nivel">{args.children}</a>
    </Badge>
  ),
  args: { variant: 'link', children: 'Ver nível' },
};
