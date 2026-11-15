import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar';

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#2b6b52"/><circle cx="20" cy="16" r="7" fill="#f3f5f1"/><path d="M6 38c2-9 8-13 14-13s12 4 14 13z" fill="#f3f5f1"/></svg>',
)}`;

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  args: { size: 'default' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'A foto de uma pessoa, ou as iniciais quando não há foto ou ela não carrega. `AvatarImage` precisa de `alt` com o nome; `AvatarFallback` aparece até a imagem carregar. `AvatarBadge` marca um estado no canto e `AvatarGroup` empilha vários, com `AvatarGroupCount` para os que sobram.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={portrait} alt="Ana Lima" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

export const WithBadge: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AL</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  ),
  args: { size: 'lg' },
};

export const Group: Story = {
  render: (args) => (
    <AvatarGroup>
      {['AL', 'BR', 'CM'].map((initials) => (
        <Avatar key={initials} {...args}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
};
