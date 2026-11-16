import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter } from '../../../.storybook/decorators';
import { newCourse, typescriptCourse } from '../../../.storybook/fixtures';
import { CourseCard } from './CourseCard';

const meta = {
  title: 'Components/Course/CourseCard',
  component: CourseCard,
  args: { course: typescriptCourse },
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Um curso no catálogo e na busca: capa, título, instrutor, nota, aulas e alunos. O cartão inteiro é o link para a página do curso, que começa a carregar quando o ponteiro chega nele (`prefetch="intent"`).',
      },
    },
  },
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewCourse: Story = { args: { course: newCourse } };
