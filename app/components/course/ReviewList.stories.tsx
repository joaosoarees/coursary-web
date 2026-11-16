import type { Meta, StoryObj } from '@storybook/react-vite';

import { withApi } from '../../../.storybook/decorators';
import { reviews } from '../../../.storybook/fixtures';
import { ReviewList } from './ReviewList';

const REVIEWS = 'GET /courses/c-3/reviews';

const meta = {
  title: 'Components/Course/ReviewList',
  component: ReviewList,
  args: { courseId: 'c-3' },
  argTypes: { courseId: { control: false } },
  decorators: [
    withApi,
    (Story) => (
      <div className="w-[40rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    api: { [REVIEWS]: { body: { items: reviews, nextCursor: null } } },
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'As avaliações na página do curso, as mais novas primeiro: nome, estrelas (lidas como "4 de 5"), data e o comentário, quando há. Busca as próprias páginas pelo `courseId`, dez por vez, com o botão para as seguintes. Tem estado para carregando, para nenhuma avaliação ainda e para a falha.',
      },
    },
  },
} satisfies Meta<typeof ReviewList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MoreToLoad: Story = {
  parameters: {
    api: { [REVIEWS]: { body: { items: reviews, nextCursor: 'next' } } },
  },
};

export const NoReviews: Story = {
  parameters: { api: { [REVIEWS]: { body: { items: [], nextCursor: null } } } },
};

export const Loading: Story = { parameters: { api: { [REVIEWS]: 'pending' } } };

export const Failed: Story = {
  parameters: { api: { [REVIEWS]: { status: 500 } } },
};
