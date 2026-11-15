import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from './field';
import { Input } from './input';
import { Textarea } from './textarea';

const meta = {
  title: 'UI/Field',
  component: Field,
  args: { orientation: 'vertical' },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal', 'responsive'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Um campo de formulário com rótulo, ajuda e erro. `FieldLabel` aponta para o controle com `htmlFor`; `FieldDescription` e `FieldError` são ligados a ele por `aria-describedby`. Com `data-invalid`, o campo todo fica na cor de erro; o controle leva `aria-invalid`. `FieldGroup` empilha campos e `FieldSet` com `FieldLegend` agrupa os que respondem a uma pergunta só.',
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="field-title">Título do curso</FieldLabel>
      <Input id="field-title" aria-describedby="field-title-hint" />
      <FieldDescription id="field-title-hint">
        Até 120 caracteres.
      </FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field {...args} data-invalid>
      <FieldLabel htmlFor="field-email">E-mail</FieldLabel>
      <Input
        id="field-email"
        type="email"
        defaultValue="ana@"
        aria-invalid
        aria-describedby="field-email-error"
      />
      <FieldError
        id="field-email-error"
        errors={[{ message: 'Digite um e-mail válido.' }]}
      />
    </Field>
  ),
};

export const ManyErrors: Story = {
  render: (args) => (
    <Field {...args} data-invalid>
      <FieldLabel htmlFor="field-password">Senha</FieldLabel>
      <Input
        id="field-password"
        type="password"
        aria-invalid
        aria-describedby="field-password-error"
      />
      <FieldError
        id="field-password-error"
        errors={[
          { message: 'Use ao menos 8 caracteres.' },
          { message: 'Use ao menos um número.' },
          { message: 'Use ao menos 8 caracteres.' },
        ]}
      />
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Mais de um erro vira lista; mensagens repetidas aparecem uma vez.',
      },
    },
  },
};

export const Horizontal: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldContent>
        <FieldLabel htmlFor="field-slug">Endereço</FieldLabel>
        <FieldDescription>Parte final do link do curso.</FieldDescription>
      </FieldContent>
      <Input id="field-slug" defaultValue="introducao-typescript" />
    </Field>
  ),
  args: { orientation: 'horizontal' },
};

export const Group: Story = {
  render: (args) => (
    <FieldSet>
      <FieldLegend>Sobre o curso</FieldLegend>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="group-title">Título</FieldLabel>
          <Input id="group-title" />
        </Field>
        <FieldSeparator>Opcional</FieldSeparator>
        <Field {...args}>
          <FieldLabel htmlFor="group-description">Descrição</FieldLabel>
          <Textarea id="group-description" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
