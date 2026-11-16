import type { Meta, StoryObj } from '@storybook/react-vite';

import { CourseRating } from './CourseRating';

const meta = {
  title: 'Components/Course/CourseRating',
  component: CourseRating,
  args: { average: 4.6, count: 128 },
  argTypes: {
    average: { control: { type: 'number', min: 1, max: 5, step: 0.1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A nota média de um curso, com uma casa decimal em pt-BR, e quantas avaliações a formam. Sem nenhuma avaliação (`average: null`), diz isso em vez de mostrar zero.',
      },
    },
  },
} satisfies Meta<typeof CourseRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoReviews: Story = { args: { average: null, count: 0 } };
