import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LessonAttachments } from '~/components/lesson/LessonAttachments';
import { LessonService } from '~/services/LessonService';
import { apiError } from '~/test/renderRoutes';

const assign = vi.fn();

beforeEach(() => {
  vi.stubGlobal('location', { href: window.location.href, assign });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderList = () =>
  render(
    <LessonAttachments
      courseId="c1"
      lessonId="l1"
      attachments={[
        {
          id: 'f1',
          name: 'guia.pdf',
          contentType: 'application/pdf',
          size: 3 * 1024 * 1024,
        },
      ]}
    />,
  );

describe('LessonAttachments', () => {
  it('should show each file with its kind and size', () => {
    renderList();

    expect(
      screen.getByRole('region', { name: 'Material' }),
    ).toBeInTheDocument();
    expect(screen.getByText('guia.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF · 3 MB')).toBeInTheDocument();
  });

  it('should ask for the address on click and go to it', async () => {
    const download = vi
      .spyOn(LessonService, 'attachmentDownload')
      .mockResolvedValue({
        url: 'https://files.test/guia.pdf',
        expiresIn: 300,
      });
    renderList();

    fireEvent.click(screen.getByRole('button', { name: 'Baixar guia.pdf' }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://files.test/guia.pdf');
    });
    expect(download).toHaveBeenCalledWith({
      courseId: 'c1',
      lessonId: 'l1',
      fileId: 'f1',
    });
  });

  it('should stay focusable and ask only once while the address is on its way', async () => {
    let answer: (value: { url: string; expiresIn: number }) => void = () =>
      undefined;
    const download = vi
      .spyOn(LessonService, 'attachmentDownload')
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            answer = resolve;
          }),
      );
    renderList();
    const button = screen.getByRole('button', { name: 'Baixar guia.pdf' });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Baixando…');
    expect(download).toHaveBeenCalledTimes(1);

    answer({ url: 'https://files.test/guia.pdf', expiresIn: 300 });
    await waitFor(() => {
      expect(button).toHaveTextContent('Baixar');
    });
  });

  it('should say so when the address cannot be had', async () => {
    vi.spyOn(LessonService, 'attachmentDownload').mockRejectedValue(
      apiError(500, 'INTERNAL'),
    );
    const error = vi.spyOn(toast, 'error');
    renderList();

    fireEvent.click(screen.getByRole('button', { name: 'Baixar guia.pdf' }));

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith(
        'Não foi possível concluir. Tente de novo.',
      );
    });
    expect(assign).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Baixar guia.pdf' }),
    ).toBeEnabled();
  });
});
