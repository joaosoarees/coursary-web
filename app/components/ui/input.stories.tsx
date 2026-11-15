import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    'aria-label': 'Título do curso',
    placeholder: 'Introdução ao TypeScript',
    onChange: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'number', 'file'],
    },
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
          'Um campo de uma linha. Sempre com nome: um `FieldLabel` com `htmlFor` (veja Field) ou, sem rótulo visível, `aria-label`. `aria-invalid` pinta o erro; o placeholder é exemplo, nunca o rótulo.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'Introdução ao TypeScript' },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'ana@' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ana@coursary.com' },
};

export const Password: Story = {
  args: { type: 'password', 'aria-label': 'Senha', placeholder: undefined },
};

export const File: Story = {
  args: {
    type: 'file',
    'aria-label': 'Material da aula',
    placeholder: undefined,
  },
};
