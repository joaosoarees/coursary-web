import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

const students = [
  { name: 'Ana Lima', email: 'ana@exemplo.com', progress: 100 },
  { name: 'Bruno Reis', email: 'bruno@exemplo.com', progress: 45 },
  { name: 'Carla Mota', email: 'carla@exemplo.com', progress: 0 },
];

const meta = {
  title: 'UI/Table',
  component: Table,
  render: (args) => (
    <Table {...args}>
      <TableCaption>Alunos de Introdução ao TypeScript</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="text-right">Progresso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.email}>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell className="text-right">{student.progress}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dados em linhas e colunas, como os alunos de um curso. Rola na horizontal quando não cabe. `TableCaption` dá o nome da tabela ao leitor de tela; uma linha com `data-state="selected"` fica marcada.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Curso</TableHead>
          <TableHead className="text-right">Alunos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Introdução ao TypeScript</TableCell>
          <TableCell className="text-right">128</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell>React do zero</TableCell>
          <TableCell className="text-right">64</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">192</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WithBadges: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Conta</TableHead>
          <TableHead>Papel</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ana Lima</TableCell>
          <TableCell>
            <Badge variant="outline">Instrutor</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bruno Reis</TableCell>
          <TableCell>
            <Badge variant="destructive">Desativada</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
