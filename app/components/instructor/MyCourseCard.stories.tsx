import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter } from '../../../.storybook/decorators';
import { myCourse } from '../../../.storybook/fixtures';
import { MyCourseCard, MyCourseCardSkeleton } from './MyCourseCard';

const meta = {
  title: 'Components/Instructor/MyCourseCard',
  component: MyCourseCard,
  args: { course: myCourse },
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-[44rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Um curso em "Meus cursos" do instrutor: capa, estado, título e uma linha de fatos que muda com o estado (o rascunho diz quando foi criado; o publicado, quantos alunos e desde quando; o arquivado, que saiu do catálogo). O cartão inteiro abre a edição do curso.',
      },
    },
  },
} satisfies Meta<typeof MyCourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Published: Story = {};

export const Draft: Story = {
  args: {
    course: {
      ...myCourse,
      status: 'DRAFT',
      lessonCount: 0,
      enrollmentCount: 0,
      publishedAt: null,
    },
  },
};

export const Archived: Story = {
  args: { course: { ...myCourse, status: 'ARCHIVED' } },
};

export const Loading: Story = { render: () => <MyCourseCardSkeleton /> };
