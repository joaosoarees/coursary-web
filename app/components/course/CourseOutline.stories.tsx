import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter } from '../../../.storybook/decorators';
import { modules, progress } from '../../../.storybook/fixtures';
import { CourseOutline } from './CourseOutline';

const meta = {
  title: 'Components/Course/CourseOutline',
  component: CourseOutline,
  args: { courseId: 'c-3', modules },
  argTypes: {
    modules: { control: false },
    progress: { control: false },
  },
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-[40rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'O conteúdo do curso na página dele: os módulos, com quantas aulas e quanto tempo cada um tem, e as aulas. Para quem não está matriculado, só a lista. Com `progress`, cada aula vira um link, as feitas ganham o check, a aula onde a pessoa parou fica marcada e cada módulo conta as concluídas.',
      },
    },
  },
} satisfies Meta<typeof CourseOutline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotEnrolled: Story = {};

export const Enrolled: Story = { args: { progress } };

export const JustEnrolled: Story = {
  args: {
    progress: {
      completedLessons: 0,
      completedLessonIds: [],
      lastLessonId: null,
      positionSeconds: null,
    },
  },
};

export const Finished: Story = {
  args: {
    progress: {
      completedLessons: 5,
      completedLessonIds: ['l-1', 'l-2', 'l-3', 'l-4', 'l-5'],
      lastLessonId: 'l-5',
      positionSeconds: null,
    },
  },
};
