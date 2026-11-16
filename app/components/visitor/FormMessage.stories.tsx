import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormAlert, FormNotice } from './FormMessage';

const meta = {
  title: 'Components/Visitor/FormMessage',
  component: FormAlert,
  args: { children: 'E-mail ou senha incorretos.' },
  argTypes: { children: { control: 'text' } },
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
          'O aviso do formulário inteiro, acima dos botões: `FormAlert` quando a API recusou o envio (`role="alert"`, lido na hora) e `FormNotice` quando deu certo e a pessoa segue na tela (`role="status"`). O erro de um campo só vai no `FieldError` do campo, e não aqui.',
      },
    },
  },
} satisfies Meta<typeof FormAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alert: Story = {};

export const Notice: Story = {
  args: { children: 'Enviamos um novo código para ana@exemplo.com.' },
  render: (args) => <FormNotice {...args} />,
};
