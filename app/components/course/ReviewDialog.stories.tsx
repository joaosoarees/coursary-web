import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn, screen, userEvent } from 'storybook/test';

import { Button } from '~/components/ui/button';

import { withApi } from '../../../.storybook/decorators';
import { myReview } from '../../../.storybook/fixtures';
import { ReviewDialog } from './ReviewDialog';

const SAVE = 'PUT /courses/c-3/review';

const meta = {
  title: 'Components/Course/ReviewDialog',
  component: ReviewDialog,
  args: {
    courseId: 'c-3',
    courseTitle: 'TypeScript do zero',
    review: null,
    finished: false,
    open: true,
    onOpenChange: fn(),
  },
  argTypes: {
    courseId: { control: false },
    review: { control: false },
    open: { control: false },
  },
  // The dialog is controlled: held here, Cancelar, Esc and a saved review close it as in the app.
  render: function Render({ open: initiallyOpen, onOpenChange, ...args }) {
    const [open, setOpen] = useState(initiallyOpen);

    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            setOpen(true);
          }}
        >
          Avaliar o curso
        </Button>
        <ReviewDialog
          {...args}
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            onOpenChange(next);
          }}
        />
      </>
    );
  },
  decorators: [withApi],
  parameters: {
    api: { [SAVE]: { body: myReview } },
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component:
          'A avaliação de quem está matriculado: de 1 a 5 estrelas e um comentário opcional de até 2.000 caracteres, salvos de uma vez. Cada abertura começa da avaliação salva (`review`); sem ela, começa vazia, com o envio desligado até haver nota. Com `finished`, é o convite que aparece ao concluir o curso, e "Agora não" fecha. Se a API recusar, o erro aparece dentro.',
      },
    },
  },
} satisfies Meta<typeof ReviewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {};

export const Editing: Story = { args: { review: myReview } };

export const AfterFinishing: Story = { args: { finished: true } };

export const Closed: Story = { args: { open: false } };

// The dialog renders in a portal, outside the story's canvas.
const save = async () => {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Salvar avaliação' }),
  );
};

export const Sending: Story = {
  args: { review: myReview },
  play: save,
  parameters: { api: { [SAVE]: 'pending' } },
};

export const Refused: Story = {
  args: { review: myReview },
  play: save,
  parameters: { api: { [SAVE]: { status: 500 } } },
};
