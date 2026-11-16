import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';

import { Label } from '~/components/ui/label';

import { CodeInput } from './CodeInput';

const meta = {
  title: 'Components/Visitor/CodeInput',
  component: CodeInput,
  args: { maxLength: 6 },
  render: function Render(args) {
    const id = useId();

    return (
      <div className="flex w-72 flex-col gap-2">
        <Label htmlFor={id}>Código</Label>
        <CodeInput id={id} {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'O campo do código de seis dígitos que chega por e-mail, na confirmação da conta e na troca de senha. Um campo só, e não seis caixas: colar funciona, e o celular oferece o código do e-mail (`one-time-code`) com o teclado numérico. É texto, e não `number`, para não perder o zero da frente.',
      },
    },
  },
} satisfies Meta<typeof CodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: '048213' } };
