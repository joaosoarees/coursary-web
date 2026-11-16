import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { LoadMore } from './LoadMore';

const list = {
  isFetching: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  hasNextPage: true,
  fetchNextPage: fn(() => Promise.resolve()),
};

const meta = {
  title: 'Components/LoadMore',
  component: LoadMore,
  args: {
    list,
    labels: {
      more: 'Mais cursos',
      loading: 'Carregando mais cursos…',
      failed: 'Não deu para carregar mais cursos.',
    },
    auto: false,
    size: 'default',
  },
  argTypes: {
    list: { control: false },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'O fim de uma lista infinita (`useInfiniteQuery`): recebe a query inteira em `list` e mostra o botão enquanto há página seguinte. Com `auto`, pede a próxima sozinho quando o fim da lista entra na tela, e o botão fica para quem usa teclado. Quando a página falha, o aviso aparece e o botão vira "Tentar de novo".',
      },
    },
  },
} satisfies Meta<typeof LoadMore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { list: { ...list, isFetching: true, isFetchingNextPage: true } },
};

export const Failed: Story = {
  args: { list: { ...list, isFetchNextPageError: true } },
};

export const Small: Story = { args: { size: 'sm' } };
