import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  useVideoUpload,
  VideoUploadPhase,
} from '~/instructor/lesson/useVideoUpload';
import { VideoCard } from '~/instructor/lesson/VideoCard';
import type { SignedUrl } from '~/services/LessonService';
import { VideoService } from '~/services/VideoService';

const MIB = 1024 * 1024;
const video: SignedUrl = {
  url: 'https://bucket.example/lesson/l1/video/f1/original',
  expiresIn: 3600,
};

const uploadIn = (
  phase: VideoUploadPhase,
  problem?: string,
): ReturnType<typeof useVideoUpload> => ({
  phase,
  problem,
  notice: undefined,
  uploading: phase.step === 'uploading',
  upload: vi.fn(() => Promise.resolve()),
  cancel: vi.fn(),
});

const renderCard = ({
  current = video,
  upload = uploadIn({ step: 'idle' }),
  readOnly = false,
}: {
  current?: SignedUrl | null;
  upload?: ReturnType<typeof useVideoUpload>;
  readOnly?: boolean;
} = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <VideoCard
        courseId="c1"
        lessonId="l1"
        video={current ?? undefined}
        readOnly={readOnly}
        upload={upload}
      />
    </QueryClientProvider>,
  );

describe('VideoCard', () => {
  it('should invite to send a video when the lesson has none', () => {
    renderCard({ current: null });

    expect(screen.getByText('Sem vídeo')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enviar vídeo' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Remover vídeo' })).toBeNull();
  });

  it('should play the current video and offer to replace or remove it', () => {
    const { container } = renderCard();

    expect(container.querySelector('video')).toHaveAttribute('src', video.url);
    expect(screen.getByRole('button', { name: 'Trocar vídeo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Remover vídeo' })).toBeVisible();
  });

  it('should hand the chosen file to the upload', () => {
    const upload = uploadIn({ step: 'idle' });
    const { container } = renderCard({ upload });
    const file = new File(['x'], 'aula.mp4', { type: 'video/mp4' });
    const picker = container.querySelector('input[type="file"]');

    if (!picker) {
      throw new Error('No file input.');
    }
    fireEvent.change(picker, { target: { files: [file] } });

    expect(upload.upload).toHaveBeenCalledWith(file);
  });

  it('should show the progress on the frame while the first video goes up', () => {
    renderCard({
      current: null,
      upload: uploadIn({
        step: 'uploading',
        name: 'aula-02.mp4',
        loaded: 312 * MIB,
        total: 840 * MIB,
      }),
    });

    expect(screen.getByText('Enviando… 37%')).toBeVisible();
    expect(screen.queryByText(/o atual continua no ar/)).toBeNull();
  });

  it('should show the progress of a replacement and let it be cancelled', () => {
    const upload = uploadIn({
      step: 'uploading',
      name: 'aula-02.mp4',
      loaded: 312 * MIB,
      total: 840 * MIB,
    });
    const { container } = renderCard({ upload });

    expect(
      screen.getByRole('progressbar', { name: 'Envio do vídeo' }),
    ).toHaveAttribute('aria-valuenow', '37');
    expect(container.querySelector('video')).toHaveAttribute('src', video.url);
    expect(screen.queryByText('Enviando… 37%')).toBeNull();
    expect(screen.getByText('312 de 840 MB · 37%')).toBeVisible();
    expect(
      screen.getByText(/o atual continua no ar até ele ficar pronto/),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar envio' }));

    expect(upload.cancel).toHaveBeenCalled();
  });

  it('should show what stopped the upload', () => {
    renderCard({
      upload: uploadIn({ step: 'idle' }, 'O envio parou na parte 9 de 53.'),
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O envio parou na parte 9 de 53.',
    );
  });

  it('should remove the video only after confirming', async () => {
    const remove = vi.spyOn(VideoService, 'delete').mockResolvedValue();
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Remover vídeo' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Remover o vídeo desta aula?',
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Remover o vídeo' }),
    );

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith({ courseId: 'c1', lessonId: 'l1' });
    });
  });

  it('should only show the video of an archived course', () => {
    renderCard({ readOnly: true });

    expect(screen.queryByRole('button')).toBeNull();
  });
});
