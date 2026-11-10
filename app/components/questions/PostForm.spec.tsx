import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { PostForm } from '~/components/questions/PostForm';
import { apiError } from '~/test/renderRoutes';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const renderForm = (onPost: (text: string) => Promise<unknown>) =>
  render(
    <PostForm
      label="Sua resposta"
      placeholder="Escreva a sua resposta"
      emptyMessage="Escreva a resposta antes de enviar."
      submit={{ label: 'Responder', pending: 'Enviando…' }}
      rows={2}
      onPost={onPost}
    />,
  );

const field = () => screen.getByRole('textbox', { name: 'Sua resposta' });

const type = (value: string) => {
  fireEvent.change(field(), { target: { value } });
};

describe('PostForm', () => {
  it('should send the trimmed text, then empty the field and keep the focus there', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    renderForm(onPost);

    type('  Tente com parse_dates.  ');
    fireEvent.click(screen.getByRole('button', { name: 'Responder' }));

    await waitFor(() => {
      expect(field()).toHaveValue('');
    });
    expect(onPost).toHaveBeenCalledWith('Tente com parse_dates.');
    expect(field()).toHaveFocus();
  });

  it('should send with Ctrl+Enter, while Enter alone breaks the line', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    renderForm(onPost);

    type('Uma linha\noutra');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onPost).not.toHaveBeenCalled();
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(onPost).toHaveBeenCalledWith('Uma linha\noutra');
    });
  });

  it('should refuse a text of spaces', async () => {
    const onPost = vi.fn();
    renderForm(onPost);

    type('   ');
    fireEvent.click(screen.getByRole('button', { name: 'Responder' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Escreva a resposta antes de enviar.',
    );
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(onPost).not.toHaveBeenCalled();
  });

  it('should keep the text and explain a failure in the form', async () => {
    renderForm(vi.fn().mockRejectedValue(apiError(500, 'INTERNAL')));

    type('Tente de novo');
    fireEvent.click(screen.getByRole('button', { name: 'Responder' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível concluir. Tente de novo.',
    );
    expect(field()).toHaveValue('Tente de novo');
  });

  it('should explain an out-of-date screen in a toast, since the form may go away', async () => {
    renderForm(vi.fn().mockRejectedValue(apiError(409, 'QUESTION_REMOVED')));

    type('Tarde demais');
    fireEvent.click(screen.getByRole('button', { name: 'Responder' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'A pergunta foi removida enquanto você respondia. A lista foi atualizada.',
      );
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should count the characters only near the limit', async () => {
    renderForm(vi.fn());

    type('a'.repeat(1799));
    expect(screen.queryByText(/de 2\.000/)).not.toBeInTheDocument();

    type('a'.repeat(1800));
    expect(await screen.findByText('1.800 de 2.000')).toBeInTheDocument();
  });
});
