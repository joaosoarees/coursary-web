import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';

import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'UI/Label',
  component: Label,
  args: { children: 'E-mail' },
  argTypes: { htmlFor: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'O nome de um controle, ligado a ele por `htmlFor`: clicar no rótulo foca o campo. Num formulário, prefira `FieldLabel`, que já vem dentro de `Field`.',
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInput: Story = {
  render: function Render(args) {
    const id = useId();

    return (
      <div className="flex w-80 flex-col gap-2">
        <Label {...args} htmlFor={`${id}-email`} />
        <Input id={`${id}-email`} type="email" />
      </div>
    );
  },
};

export const WithDisabledInput: Story = {
  render: function Render(args) {
    const id = useId();

    return (
      <div className="flex w-80 flex-col gap-2">
        <Input
          id={`${id}-email`}
          type="email"
          disabled
          className="peer order-2"
        />
        <Label {...args} htmlFor={`${id}-email`} className="order-1" />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'O rótulo apaga junto quando vem depois de um campo desabilitado no DOM (`peer-disabled`).',
      },
    },
  },
};
