import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Textarea } from './textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Descrição do curso',
    placeholder: 'O que o aluno vai aprender',
    onChange: fn(),
  },
  argTypes: {
    disabled: { control: 'boolean' },
    'aria-invalid': { control: 'boolean' },
  },
  decorators: [
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
          'Um campo de várias linhas que cresce com o texto. As mesmas regras do Input: sempre com nome, `aria-invalid` para o erro.',
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue:
      'Tipos, funções e módulos, do zero até o primeiro projeto.\n\nCada aula termina com um exercício.',
  },
};

export const Invalid: Story = { args: { 'aria-invalid': true } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Curso arquivado.' },
};
