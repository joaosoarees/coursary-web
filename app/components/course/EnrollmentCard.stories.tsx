import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter } from '../../../.storybook/decorators';
import { enrollment } from '../../../.storybook/fixtures';
import { EnrollmentCard, EnrollmentCardSkeleton } from './EnrollmentCard';

const meta = {
  title: 'Components/Course/EnrollmentCard',
  component: EnrollmentCard,
  args: { enrollment },
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
          'Uma matrícula em "Minhas matrículas": capa, título, instrutor e o progresso. O cartão inteiro leva de volta à aula onde a pessoa parou (`/continuar`). Um curso arquivado continua aqui, com o selo e a frase de que o acesso segue. Em tela estreita a capa vai para cima.',
      },
    },
  },
} satisfies Meta<typeof EnrollmentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const Finished: Story = {
  args: { enrollment: { ...enrollment, completedLessons: 12 } },
};

export const Archived: Story = {
  args: { enrollment: { ...enrollment, courseStatus: 'ARCHIVED' } },
};

export const Loading: Story = { render: () => <EnrollmentCardSkeleton /> };
