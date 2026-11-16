import type { Meta, StoryObj } from '@storybook/react-vite';

import { CourseCover } from './CourseCover';

const meta = {
  title: 'Components/Course/CourseCover',
  component: CourseCover,
  args: { courseId: 'c-3', title: 'TypeScript do zero', large: false },
  argTypes: { coverUrl: { control: false } },
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
          'A capa de um curso, em 16:9. Com `coverUrl`, a imagem enviada pelo instrutor (480 e 1280 px, escolhidas pelo `srcSet`). Sem ela, uma lousa com o título em giz: a cor do giz (branco, azul ou rosa) sai do `courseId`, então o mesmo curso tem sempre a mesma capa. O texto acompanha a largura da capa, e não da tela. `large` é a capa da página do curso, carregada logo.',
      },
    },
  },
} satisfies Meta<typeof CourseCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BlueChalk: Story = {
  args: { courseId: 'c-1', title: 'React com testes' },
};

export const PinkChalk: Story = {
  args: { courseId: 'c-2', title: 'Design de APIs REST na prática' },
};

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#2b6b52"/><circle cx="12" cy="3" r="1.6" fill="#fcf3d4"/><path d="M0 9 L5 4 L9 7 L12 5 L16 9 Z" fill="#1f3a2e"/></svg>',
)}`;

export const Uploaded: Story = {
  args: { coverUrl: { '480': photo, '1280': photo } },
};

export const LongTitle: Story = {
  args: {
    title:
      'Arquitetura serverless na AWS com Lambda, DynamoDB e filas do começo ao deploy',
  },
};
