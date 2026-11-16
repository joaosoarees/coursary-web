import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraduationCap, SearchX } from 'lucide-react';

import { EmptyState } from './EmptyState';
import { Button } from './ui/button';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    icon: GraduationCap,
    title: 'Nenhuma matrícula ainda',
    description: 'Os cursos em que você se matricular aparecem aqui.',
    headingLevel: 'h2',
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
    headingLevel: { control: 'inline-radio', options: ['h2', 'h3'] },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'O lugar de uma lista que não tem nada: diz o que apareceria ali e, quando há, o próximo passo. A borda tracejada marca o espaço vazio. `headingLevel` acompanha a página: `h2` quando a lista é o conteúdo, `h3` dentro de uma seção.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: { action: <Button>Ver o catálogo</Button> },
};

export const NoResults: Story = {
  args: {
    icon: SearchX,
    title: 'Nenhum curso com "kotlin"',
    description: 'Tente outra palavra ou limpe a busca.',
    headingLevel: 'h3',
  },
};
