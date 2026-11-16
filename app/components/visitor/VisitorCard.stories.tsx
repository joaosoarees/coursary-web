import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { withRouter } from '../../../.storybook/decorators';
import { CodeInput } from './CodeInput';
import { PasswordInput } from './PasswordInput';
import { VisitorCard } from './VisitorCard';

function SignInFields() {
  const id = useId();

  return (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-email`}>E-mail</Label>
        <Input id={`${id}-email`} type="email" autoComplete="email" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-password`}>Senha</Label>
        <PasswordInput id={`${id}-password`} autoComplete="current-password" />
      </div>
      <Button type="button">Entrar</Button>
    </form>
  );
}

function CodeFields() {
  const id = useId();

  return (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>Código</Label>
        <CodeInput id={id} />
      </div>
      <Button type="button">Confirmar</Button>
    </form>
  );
}

const meta = {
  title: 'Components/Visitor/VisitorCard',
  component: VisitorCard,
  args: {
    title: 'Entrar',
    description: 'Use o e-mail e a senha da sua conta.',
    footer: 'Ainda não tem conta? Crie uma.',
    children: <SignInFields />,
  },
  argTypes: {
    children: { control: false },
    step: { control: false },
    back: { control: false },
  },
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-[28rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'O cartão das telas de quem ainda não entrou (entrar, criar conta, confirmar, recuperar a senha): o `h1`, uma frase, o formulário e, embaixo, um rodapé para a outra tela. Nos fluxos de duas etapas, `step` põe o `StepMarker`; `back` põe o link de volta acima do cartão.',
      },
    },
  },
} satisfies Meta<typeof VisitorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};

export const SecondStep: Story = {
  args: {
    title: 'Confirme o e-mail',
    description: 'Enviamos um código de 6 dígitos para ana@exemplo.com.',
    step: { current: 2, total: 2 },
    back: { to: '/cadastro', label: 'Voltar ao cadastro' },
    footer: undefined,
    children: <CodeFields />,
  },
};
