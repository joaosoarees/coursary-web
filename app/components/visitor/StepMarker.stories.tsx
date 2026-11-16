import type { Meta, StoryObj } from '@storybook/react-vite';

import { StepMarker } from './StepMarker';

const meta = {
  title: 'Components/Visitor/StepMarker',
  component: StepMarker,
  args: { current: 1, total: 2 },
  argTypes: {
    current: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Em que etapa de um fluxo de visitante a pessoa está, como na criação de conta (dados, depois o código). Um traço de giz por etapa, cheio até a atual, e a frase "Etapa N de M", que é o que o leitor de tela lê.',
      },
    },
  },
} satisfies Meta<typeof StepMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {};

export const LastStep: Story = { args: { current: 2 } };

export const ThreeSteps: Story = { args: { current: 2, total: 3 } };
