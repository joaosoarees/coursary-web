import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReviewDialog } from '~/components/course/ReviewDialog';
import { type MyReview, ReviewService } from '~/services/ReviewService';
import { apiError } from '~/test/renderRoutes';

const saved: MyReview = {
  courseId: 'c1',
  rating: 3,
  comment: 'Bom.',
  createdAt: '2026-11-04T12:00:00.000Z',
  updatedAt: '2026-11-04T12:00:00.000Z',
};

const renderDialog = (
  props: Partial<React.ComponentProps<typeof ReviewDialog>> = {},
) => {
  const onOpenChange = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ReviewDialog
        courseId="c1"
        courseTitle="DynamoDB na prática"
        review={null}
        open
        onOpenChange={onOpenChange}
        {...props}
      />
    </QueryClientProvider>,
  );

  return { onOpenChange };
};

describe('ReviewDialog', () => {
  it('should send a new rating with its comment and close', async () => {
    const save = vi.spyOn(ReviewService, 'save').mockResolvedValue(saved);
    const { onOpenChange } = renderDialog();
    const send = screen.getByRole('button', { name: 'Enviar avaliação' });

    expect(
      screen.getByRole('heading', { name: 'Avaliar o curso' }),
    ).toBeVisible();
    expect(send).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: '4 estrelas' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Comentário/ }), {
      target: { value: '  Direto ao ponto.  ' },
    });
    fireEvent.click(send);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(save).toHaveBeenCalledWith({
      courseId: 'c1',
      rating: 4,
      comment: 'Direto ao ponto.',
    });
  });

  it('should start from the saved review when editing it', () => {
    renderDialog({ review: saved });

    expect(
      screen.getByRole('heading', { name: 'Editar sua avaliação' }),
    ).toBeVisible();
    expect(screen.getByRole('radio', { name: '3 estrelas' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /Comentário/ })).toHaveValue(
      'Bom.',
    );
    expect(
      screen.getByRole('button', { name: 'Salvar avaliação' }),
    ).toBeEnabled();
  });

  it('should invite a review once the course is done', () => {
    renderDialog({ finished: true });

    expect(
      screen.getByRole('heading', { name: 'Você concluiu o curso' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Agora não' })).toBeVisible();
  });

  it('should say so and stay open when the review is refused', async () => {
    vi.spyOn(ReviewService, 'save').mockRejectedValue(
      apiError(500, 'INTERNAL'),
    );
    const { onOpenChange } = renderDialog({ review: saved });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(
      await screen.findByText('Não foi possível concluir. Tente de novo.'),
    ).toBeVisible();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
