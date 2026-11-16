import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';

import { Label } from '~/components/ui/label';

import { PasswordInput } from './PasswordInput';

const meta = {
  title: 'Components/Visitor/PasswordInput',
  component: PasswordInput,
  args: { disabled: false, autoComplete: 'current-password' },
  argTypes: {
    disabled: { control: 'boolean' },
    defaultValue: { control: false },
  },
  render: function Render(args) {
    const id = useId();

    return (
      <div className="flex w-72 flex-col gap-2">
        <Label htmlFor={id}>Senha</Label>
        <PasswordInput id={id} {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'O campo de senha das telas de entrada, com o olho que mostra o que foi digitado. O botão diz se está mostrando por `aria-pressed`, e não muda de nome. Aceita tudo que um `input` aceita, menos `type`; o `autoComplete` certo (`current-password` ou `new-password`) é de quem usa.',
      },
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: 'lousa-verde-42' } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'lousa-verde-42' },
};
