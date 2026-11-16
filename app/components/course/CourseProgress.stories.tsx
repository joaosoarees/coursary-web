import type { Meta, StoryObj } from '@storybook/react-vite';

import { CourseProgress } from './CourseProgress';

const meta = {
  title: 'Components/Course/CourseProgress',
  component: CourseProgress,
  args: { completed: 5, total: 12, spelledOut: false },
  argTypes: {
    completed: { control: { type: 'number', min: 0 } },
    total: { control: { type: 'number', min: 0 } },
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
          'Quanto do curso a pessoa fez, em seis traços de giz e na contagem de aulas. Um curso começado tem sempre um traço feito e um inacabado deixa sempre um aberto, para os traços não desmentirem o número. Quando o número sobe, só os traços novos se desenham. `spelledOut` mostra "concluídas" na tela (fora dele, só o leitor de tela lê); `notStarted` troca o "0 de N" por uma frase.',
      },
    },
  },
} satisfies Meta<typeof CourseProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const JustStarted: Story = { args: { completed: 1, total: 40 } };

export const AlmostDone: Story = { args: { completed: 39, total: 40 } };

export const Finished: Story = { args: { completed: 12, total: 12 } };

export const NotStarted: Story = {
  args: { completed: 0, notStarted: 'Ainda não começou' },
};

export const SpelledOut: Story = { args: { spelledOut: true } };
