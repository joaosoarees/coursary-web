import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { CursorPager } from './CursorPager';

const meta = {
  title: 'Components/CursorPager',
  component: CursorPager,
  args: {
    label: 'Páginas de alunos',
    index: 1,
    range: 'Alunos 26 a 50',
    pageLabel: 'Página 2',
    canNext: true,
    busy: false,
    busyText: 'Carregando alunos…',
    onPrevious: fn(),
    onNext: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[36rem] max-w-full rounded-lg border bg-card">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Anterior e próxima para uma lista paginada por cursor, no pé de uma tabela. A API não diz o total, então o pager mostra o trecho (`range`) e o número da página, não "de N". Nas pontas o botão fica `aria-disabled` e não `disabled`, para quem acabou de apertar não perder o foco.',
      },
    },
  },
} satisfies Meta<typeof CursorPager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstPage: Story = {
  args: { index: 0, range: 'Alunos 1 a 25', pageLabel: 'Página 1' },
};

export const LastPage: Story = {
  args: {
    index: 2,
    canNext: false,
    range: 'Alunos 51 a 63',
    pageLabel: 'Página 3',
  },
};

export const Busy: Story = { args: { busy: true } };
