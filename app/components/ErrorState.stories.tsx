import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { withRouter } from '../../.storybook/decorators';
import { ErrorState } from './ErrorState';

const meta = {
  title: 'Components/ErrorState',
  component: ErrorState,
  args: { variant: 'page', onRetry: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['page', 'block'] },
    back: { control: false },
  },
  decorators: [withRouter],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'O que aparece quando algo quebra, no lugar do que não deu para mostrar: o fallback de cada error boundary e o erro de uma query que não carregou. `page` toma a página inteira, com um `h1` e o link de volta (`back`, o início por padrão); `block` toma só a parte que quebrou, e o resto da página segue. Com `onRetry`, aparece "Tentar de novo". A causa vai para o console, nunca para quem lê.',
      },
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const PageWithoutRetry: Story = {
  args: {
    onRetry: undefined,
    title: 'Curso não encontrado',
    message: 'O link pode estar errado, ou o curso saiu do catálogo.',
    back: { to: '/cursos', label: 'Ver o catálogo' },
  },
};

export const Block: Story = {
  args: {
    variant: 'block',
    title: 'Não deu para carregar as avaliações',
  },
};
