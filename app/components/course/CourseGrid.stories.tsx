import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter } from '../../../.storybook/decorators';
import {
  newCourse,
  reactCourse,
  typescriptCourse,
} from '../../../.storybook/fixtures';
import { CourseGrid, CourseGridSkeleton } from './CourseGrid';

const meta = {
  title: 'Components/Course/CourseGrid',
  component: CourseGrid,
  args: { courses: [typescriptCourse, reactCourse, newCourse] },
  argTypes: { courses: { control: false } },
  decorators: [withRouter],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A grade de cursos do catálogo e da busca: quantas colunas de pelo menos 18rem couberem, cada uma com um `CourseCard`. Enquanto a lista carrega, `CourseGridSkeleton` mostra seis cartões vazios e avisa o leitor de tela.',
      },
    },
  },
} satisfies Meta<typeof CourseGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { render: () => <CourseGridSkeleton /> };
