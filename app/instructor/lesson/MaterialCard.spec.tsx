import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MaterialCard } from '~/instructor/lesson/MaterialCard';
import { type Attachment, LessonService } from '~/services/LessonService';
import { MaterialService } from '~/services/MaterialService';

const files: Attachment[] = [
  { id: 'f1', name: 'guia.pdf', contentType: 'application/pdf', size: 1200000 },
  {
    id: 'f2',
    name: 'exercicio.xlsx',
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 184000,
  },
];

const renderCard = (readOnly = false) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MaterialCard
        courseId="c1"
        lessonId="l1"
        files={files}
        readOnly={readOnly}
      />
    </QueryClientProvider>,
  );

describe('MaterialCard', () => {
  it('should list the files with their kind, size and count', () => {
    renderCard();

    expect(screen.getByText('2 de 20 arquivos')).toBeVisible();
    expect(screen.getByText('1,1 MB').parentElement).toHaveTextContent(
      'PDF · 1,1 MB',
    );
    expect(screen.getByText('180 KB').parentElement).toHaveTextContent(
      'Planilha do Excel · 180 KB',
    );
  });

  it('should send the new order when a file moves', async () => {
    const reorder = vi
      .spyOn(MaterialService, 'reorder')
      .mockImplementation(() => new Promise(() => undefined));
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Descer guia.pdf' }));

    await waitFor(() => {
      expect(reorder).toHaveBeenCalledWith('c1', 'l1', ['f2', 'f1']);
    });
  });

  it('should delete a file only after confirming', async () => {
    const remove = vi
      .spyOn(MaterialService, 'delete')
      .mockResolvedValue(undefined);
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Apagar guia.pdf' }));
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Apagar o arquivo?',
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Apagar o arquivo' }),
    );

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith('c1', 'l1', 'f1');
    });
  });

  it('should refuse a file type the material does not take', async () => {
    const request = vi.spyOn(MaterialService, 'requestUpload');
    renderCard();

    const input = document.querySelector('input[type=file]');

    if (!input) {
      throw new Error('The card has no file input.');
    }

    fireEvent.change(input, {
      target: { files: [new File(['x'], 'foto.png')] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'não entra no material',
    );
    expect(request).not.toHaveBeenCalled();
  });

  it('should download a file from its name', async () => {
    const download = vi
      .spyOn(LessonService, 'attachmentDownload')
      .mockResolvedValue({
        url: 'https://bucket.example/guia.pdf',
        expiresIn: 300,
      });
    const assign = vi.fn();
    vi.stubGlobal('location', { href: window.location.href, assign });
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Baixar guia.pdf' }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('https://bucket.example/guia.pdf');
    });
    expect(download).toHaveBeenCalledWith({
      courseId: 'c1',
      lessonId: 'l1',
      fileId: 'f1',
    });
  });

  it('should only list the files of an archived course', () => {
    renderCard(true);

    expect(
      screen.getAllByRole('button').map((b) => b.getAttribute('aria-label')),
    ).toEqual(['Baixar guia.pdf', 'Baixar exercicio.xlsx']);
  });
});
