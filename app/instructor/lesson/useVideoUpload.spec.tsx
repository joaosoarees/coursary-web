import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useVideoUpload } from '~/instructor/lesson/useVideoUpload';
import { lessonQuery } from '~/queries/lesson';
import { type LessonContent, LessonService } from '~/services/LessonService';
import { S3Part, S3PartError } from '~/services/multipart/S3Part';
import { VideoService } from '~/services/VideoService';

const signed = (fileId: string) => ({
  url: `https://bucket.example/lesson/l1/video/${fileId}/original?X-Amz-Signature=s`,
  expiresIn: 3600,
});
const shown: LessonContent = {
  lessonId: 'l1',
  courseId: 'c1',
  body: '',
  attachments: [],
  video: signed('old'),
};
const key = lessonQuery('c1', 'l1').queryKey;
const mp4 = new File(['0123456789'], 'aula-02.mp4', { type: 'video/mp4' });

let queryClient: QueryClient;
let spies: ReturnType<typeof spyOnVideo>;

const spyOnVideo = () => ({
  start: vi.spyOn(VideoService, 'start').mockResolvedValue({
    fileId: 'new',
    partSize: 16,
    partCount: 1,
  }),
  partUrls: vi
    .spyOn(VideoService, 'partUrls')
    .mockResolvedValue([
      { partNumber: 1, url: 'https://bucket.example/part-1' },
    ]),
  complete: vi.spyOn(VideoService, 'complete').mockResolvedValue(),
  abort: vi.spyOn(VideoService, 'abort').mockResolvedValue(),
});

const renderUpload = () =>
  renderHook(() => useVideoUpload('c1', 'l1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

beforeEach(() => {
  vi.useFakeTimers();
  queryClient = new QueryClient();
  queryClient.setQueryData(key, shown);
  spies = spyOnVideo();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useVideoUpload', () => {
  it('should send the video and wait until the lesson has the new one', async () => {
    vi.spyOn(S3Part, 'put').mockResolvedValue('"etag"');
    vi.spyOn(LessonService, 'open')
      .mockResolvedValueOnce(shown)
      .mockResolvedValueOnce({ ...shown, body: 'outro', video: signed('new') });
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(3_000);
      await done;
    });

    expect(spies.start).toHaveBeenCalledWith(
      { courseId: 'c1', lessonId: 'l1' },
      { contentType: 'video/mp4', size: 10 },
      expect.any(AbortSignal),
    );
    expect(spies.complete).toHaveBeenCalledWith(
      { courseId: 'c1', lessonId: 'l1' },
      'new',
      [{ partNumber: 1, eTag: '"etag"' }],
    );
    expect(result.current.phase).toEqual({ step: 'idle' });
    expect(result.current.problem).toBeUndefined();
    expect(queryClient.getQueryData<LessonContent>(key)).toEqual({
      ...shown,
      video: signed('new'),
    });
  });

  it('should say where the network gave out, and abort the upload', async () => {
    vi.spyOn(S3Part, 'put').mockRejectedValue(new S3PartError(0, ''));
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(120_000);
      await done;
    });

    expect(result.current.problem).toBe(
      'O envio parou na parte 1 de 1. Confira a conexão e envie de novo; o que chegou foi descartado.',
    );
    expect(spies.abort).toHaveBeenCalledWith(
      { courseId: 'c1', lessonId: 'l1' },
      'new',
    );
  });

  it('should abort a cancelled upload and keep the current video', async () => {
    vi.spyOn(S3Part, 'put').mockImplementation(
      (_url, _part, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(signal.reason as Error);
          });
        }),
    );
    const { result } = renderUpload();
    let done: Promise<void> | undefined;

    await act(async () => {
      done = result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.uploading).toBe(true);

    await act(async () => {
      result.current.cancel();
      await done;
    });

    expect(result.current.phase).toEqual({ step: 'idle' });
    expect(result.current.problem).toBeUndefined();
    expect(spies.abort).toHaveBeenCalled();
    expect(queryClient.getQueryData<LessonContent>(key)?.video).toEqual(
      signed('old'),
    );
  });

  it('should go back at once on cancel, without waiting for the abort', async () => {
    vi.spyOn(S3Part, 'put').mockImplementation(
      (_url, _part, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(signal.reason as Error);
          });
        }),
    );
    spies.abort.mockImplementation(() => new Promise(() => undefined));
    const { result } = renderUpload();

    await act(async () => {
      void result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(0);
    });
    act(() => {
      result.current.cancel();
    });

    expect(result.current.phase).toEqual({ step: 'idle' });
  });

  it('should stop offering cancel once every part is in S3', async () => {
    vi.spyOn(S3Part, 'put').mockResolvedValue('"etag"');
    spies.complete.mockImplementation(() => new Promise(() => undefined));
    const { result } = renderUpload();

    await act(async () => {
      void result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.phase).toEqual({ step: 'confirming' });
    expect(result.current.uploading).toBe(false);
  });

  it('should ignore a second file while one goes up', async () => {
    vi.spyOn(S3Part, 'put').mockImplementation(
      () => new Promise(() => undefined),
    );
    const { result } = renderUpload();

    await act(async () => {
      void result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(0);
      await result.current.upload(mp4);
    });

    expect(spies.start).toHaveBeenCalledTimes(1);
  });

  it('should refuse a file that is not an MP4 before sending anything', async () => {
    const { result } = renderUpload();

    await act(async () => {
      await result.current.upload(
        new File(['x'], 'aula.mov', { type: 'video/quicktime' }),
      );
    });

    expect(result.current.problem).toBe('Envie um arquivo MP4.');
    expect(spies.start).not.toHaveBeenCalled();
  });

  it('should say so when the new video does not show up in time', async () => {
    vi.spyOn(S3Part, 'put').mockResolvedValue('"etag"');
    const open = vi.spyOn(LessonService, 'open').mockResolvedValue(shown);
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(mp4);
      await vi.advanceTimersByTimeAsync(25_000);
      await done;
    });

    expect(result.current.problem).toBeUndefined();
    expect(result.current.notice).toBe(
      'O vídeo foi enviado, mas ainda não apareceu. Recarregue a página em instantes.',
    );
    expect(open).toHaveBeenCalledTimes(20);
  });
});
