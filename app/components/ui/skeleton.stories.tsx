import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  args: { className: 'h-4 w-48' },
  parameters: {
    docs: {
      description: {
        component:
          'O lugar de um conteúdo que ainda carrega, no tamanho dele, para a tela não pular quando chega. Quem envolve o bloco anuncia o carregamento (`aria-busy` ou um texto só para leitor de tela); o esqueleto em si é decorativo. Sem movimento quando o sistema pede menos animação.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {};

export const CourseCard: Story = {
  render: () => (
    <div aria-hidden="true" className="flex w-72 flex-col gap-3">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const ListRow: Story = {
  render: () => (
    <div aria-hidden="true" className="flex w-80 items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
    </div>
  ),
};
