import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { fn } from 'storybook/test';

import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'UI/Select',
  component: Select,
  args: { onValueChange: fn(), onOpenChange: fn(), disabled: false },
  argTypes: {
    defaultOpen: { control: false },
    defaultValue: { control: false },
    open: { control: false },
    value: { control: false },
    disabled: { control: 'boolean' },
  },
  render: function Render(args) {
    const id = useId();

    return (
      <div className="flex w-64 flex-col gap-2">
        <Label htmlFor={id}>Nível</Label>
        <Select {...args}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="Escolha o nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="intermediario">Intermediário</SelectItem>
            <SelectItem value="avancado">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
  parameters: {
    docs: {
      story: { inline: false, height: '300px' },
      description: {
        component:
          'Escolhe um valor de uma lista curta num formulário. O `id` do `SelectTrigger` liga o rótulo; `SelectValue` mostra o escolhido ou o placeholder. As setas e as letras andam entre as opções. Para ações, use DropdownMenu.',
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: 'intermediario' } };

export const Open: Story = { args: { defaultOpen: true } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'iniciante' },
};

export const Grouped: Story = {
  render: function Render(args) {
    const id = useId();

    return (
      <div className="flex w-64 flex-col gap-2">
        <Label htmlFor={id}>Papel</Label>
        <Select {...args}>
          <SelectTrigger id={id} size="sm" className="w-full">
            <SelectValue placeholder="Escolha o papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Quem estuda</SelectLabel>
              <SelectItem value="aluno">Aluno</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Quem ensina</SelectLabel>
              <SelectItem value="instrutor">Instrutor</SelectItem>
              <SelectItem value="admin" disabled>
                Administrador
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  },
  args: { defaultOpen: true },
};
