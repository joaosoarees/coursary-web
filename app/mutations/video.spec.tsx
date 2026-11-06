import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDeleteVideo } from '~/mutations/video';
import { lessonQuery } from '~/queries/lesson';
import type { LessonContent } from '~/services/LessonService';
import { VideoService } from '~/services/VideoService';
import { apiError } from '~/test/renderRoutes';

const content: LessonContent = {
  lessonId: 'l1',
  courseId: 'c1',
  body: '',
  attachments: [],
  video: { url: 'https://bucket.example/v', expiresIn: 3600 },
};

const removeWith = async (answer: Promise<void>) => {
  const client = new QueryClient();
  const key = lessonQuery('c1', 'l1').queryKey;
  client.setQueryData(key, content);
  vi.spyOn(VideoService, 'delete').mockReturnValue(answer);
  const { result } = renderHook(() => useDeleteVideo('c1', 'l1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  act(() => {
    result.current.mutate();
  });

  await waitFor(() => {
    expect(result.current.isPending).toBe(false);
  });

  return { result, cached: client.getQueryData(key) };
};

describe('useDeleteVideo', () => {
  it('should take the video off the lesson', async () => {
    const { result, cached } = await removeWith(Promise.resolve());

    expect(result.current.isSuccess).toBe(true);
    expect(cached?.video).toBeUndefined();
  });

  it('should count a video removed elsewhere as removed', async () => {
    const { result, cached } = await removeWith(
      Promise.reject(apiError(404, 'VIDEO_NOT_FOUND')),
    );

    expect(result.current.isSuccess).toBe(true);
    expect(cached?.video).toBeUndefined();
  });

  it('should keep the video when the API refuses', async () => {
    const { result, cached } = await removeWith(
      Promise.reject(apiError(409, 'COURSE_ARCHIVED')),
    );

    expect(result.current.isError).toBe(true);
    expect(cached?.video).toEqual(content.video);
  });
});
