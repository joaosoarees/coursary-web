import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from 'lucide-react';

import { PageHeader } from './PageHeader';
import { Button } from './ui/button';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: {
    title: 'Meus cursos',
    description: 'Os cursos que você criou, publicados ou não.',
  },
  argTypes: { actions: { control: false } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'O topo de cada página do app: o `h1`, uma frase que diz o que a página mostra e, à direita, as ações dela. Uma página tem um só. Em tela estreita as ações descem para baixo do título.',
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    actions: (
      <Button>
        <PlusIcon aria-hidden="true" />
        Novo curso
      </Button>
    ),
  },
};

export const TitleOnly: Story = { args: { description: undefined } };
