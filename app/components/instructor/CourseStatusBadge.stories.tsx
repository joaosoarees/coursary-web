import type { Meta, StoryObj } from '@storybook/react-vite';

import { CourseStatusBadge } from './CourseStatusBadge';

const meta = {
  title: 'Components/Instructor/CourseStatusBadge',
  component: CourseStatusBadge,
  args: { status: 'DRAFT' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Em que pé está um curso do instrutor: rascunho (só ele vê), publicado (no catálogo) ou arquivado (fora do catálogo, os matriculados continuam). A palavra diz o estado; o verde do publicado e o cinza do arquivado só repetem.',
      },
    },
  },
} satisfies Meta<typeof CourseStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {};

export const Published: Story = { args: { status: 'PUBLISHED' } };

export const Archived: Story = { args: { status: 'ARCHIVED' } };
