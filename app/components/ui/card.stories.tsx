import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';
import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  title: 'UI/Card',
  component: Card,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Uma superfície que agrupa o que fala de uma coisa só, como um curso ou um bloco do perfil. `CardHeader` leva `CardTitle`, `CardDescription` e, à direita, `CardAction`; `CardContent` o corpo; `CardFooter` as ações.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Introdução ao TypeScript</CardTitle>
        <CardDescription>12 aulas · Iniciante</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Tipos, funções e módulos, do zero até o primeiro projeto.</p>
      </CardContent>
      <CardFooter>
        <Button>Continuar curso</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Introdução ao TypeScript</CardTitle>
        <CardDescription>Atualizado em 12 de novembro</CardDescription>
        <CardAction>
          <Badge variant="secondary">Rascunho</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Publique o curso quando todas as aulas tiverem conteúdo.</p>
      </CardContent>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: (args) => (
    <Card {...args}>
      <CardContent>
        <p>Nenhuma pergunta nesta aula ainda.</p>
      </CardContent>
    </Card>
  ),
};
