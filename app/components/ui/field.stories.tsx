import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';

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
  render: function Render(args) {
    const id = useId();

    return (
      <Field {...args}>
        <FieldLabel htmlFor={`${id}-title`}>Título do curso</FieldLabel>
        <Input id={`${id}-title`} aria-describedby={`${id}-title-hint`} />
        <FieldDescription id={`${id}-title-hint`}>
          Até 120 caracteres.
        </FieldDescription>
      </Field>
    );
  },
};

export const Invalid: Story = {
  render: function Render(args) {
    const id = useId();

    return (
      <Field {...args} data-invalid>
        <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
        <Input
          id={`${id}-email`}
          type="email"
          defaultValue="ana@"
          aria-invalid
          aria-describedby={`${id}-email-error`}
        />
        <FieldError
          id={`${id}-email-error`}
          errors={[{ message: 'Digite um e-mail válido.' }]}
        />
      </Field>
    );
  },
};

export const ManyErrors: Story = {
  render: function Render(args) {
    const id = useId();

    return (
      <Field {...args} data-invalid>
        <FieldLabel htmlFor={`${id}-password`}>Senha</FieldLabel>
        <Input
          id={`${id}-password`}
          type="password"
          aria-invalid
          aria-describedby={`${id}-password-error`}
        />
        <FieldError
          id={`${id}-password-error`}
          errors={[
            { message: 'Use ao menos 8 caracteres.' },
            { message: 'Use ao menos um número.' },
            { message: 'Use ao menos 8 caracteres.' },
          ]}
        />
      </Field>
    );
  },
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
  render: function Render(args) {
    const id = useId();

    return (
      <Field {...args}>
        <FieldContent>
          <FieldLabel htmlFor={`${id}-slug`}>Endereço</FieldLabel>
          <FieldDescription id={`${id}-slug-hint`}>
            Parte final do link do curso.
          </FieldDescription>
        </FieldContent>
        <Input
          id={`${id}-slug`}
          aria-describedby={`${id}-slug-hint`}
          defaultValue="introducao-typescript"
        />
      </Field>
    );
  },
  args: { orientation: 'horizontal' },
};

export const Group: Story = {
  render: function Render(args) {
    const id = useId();

    return (
      <FieldSet>
        <FieldLegend>Sobre o curso</FieldLegend>
        <FieldGroup>
          <Field {...args}>
            <FieldLabel htmlFor={`${id}-title`}>Título</FieldLabel>
            <Input id={`${id}-title`} />
          </Field>
          <FieldSeparator>Opcional</FieldSeparator>
          <Field {...args}>
            <FieldLabel htmlFor={`${id}-description`}>Descrição</FieldLabel>
            <Textarea id={`${id}-description`} />
          </Field>
        </FieldGroup>
      </FieldSet>
    );
  },
};
