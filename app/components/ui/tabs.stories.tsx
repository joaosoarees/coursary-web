import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  args: {
    defaultValue: 'aulas',
    orientation: 'horizontal',
    onValueChange: fn(),
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    defaultValue: {
      control: 'inline-radio',
      options: ['aulas', 'alunos', 'perguntas'],
    },
  },
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList>
        <TabsTrigger value="aulas">Aulas</TabsTrigger>
        <TabsTrigger value="alunos">Alunos</TabsTrigger>
        <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
      </TabsList>
      <TabsContent value="aulas">12 aulas em 3 módulos.</TabsContent>
      <TabsContent value="alunos">128 alunos matriculados.</TabsContent>
      <TabsContent value="perguntas">
        Nenhuma pergunta sem resposta.
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Partes de uma mesma tela que se alternam sem sair dela. As setas do teclado andam entre as abas. `TabsList` tem duas variantes: `line` (padrão), sublinhada, e `default`, em caixa.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {};

export const Boxed: Story = {
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList variant="default">
        <TabsTrigger value="aulas">Aulas</TabsTrigger>
        <TabsTrigger value="alunos">Alunos</TabsTrigger>
        <TabsTrigger value="perguntas" disabled>
          Perguntas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="aulas">12 aulas em 3 módulos.</TabsContent>
      <TabsContent value="alunos">128 alunos matriculados.</TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = { args: { orientation: 'vertical' } };
