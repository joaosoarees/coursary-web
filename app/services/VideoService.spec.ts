import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { VideoService } from '~/services/VideoService';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown, status = 200) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

const lesson = { courseId: 'c1', lessonId: 'l1' };
const base = '/courses/c1/lessons/l1/video';

describe('VideoService', () => {
  it('should open an upload with the type and size and read its layout', async () => {
    answer({ fileId: 'f1', partSize: 16_777_216, partCount: 3 }, 201);

    await expect(
      VideoService.start(lesson, {
        contentType: 'video/mp4',
        size: 40_000_000,
      }),
    ).resolves.toEqual({ fileId: 'f1', partSize: 16_777_216, partCount: 3 });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      method: 'post',
      url: base,
      data: JSON.stringify({ contentType: 'video/mp4', size: 40_000_000 }),
    });
  });

  it('should ask for part URLs and complete with each part ETag', async () => {
    answer({
      urls: [{ partNumber: 1, url: 'https://bucket.example/p1' }],
      expiresAt: '2026-11-06T12:00:00.000Z',
    });
    answer(undefined, 201);

    await expect(VideoService.partUrls(lesson, 'f1', [1])).resolves.toEqual([
      { partNumber: 1, url: 'https://bucket.example/p1' },
    ]);
    await VideoService.complete(lesson, 'f1', [
      { partNumber: 1, eTag: '"abc"' },
    ]);

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: `${base}/part-urls`,
      data: JSON.stringify({ fileId: 'f1', partNumbers: [1] }),
    });
    expect(adapter.mock.calls[1]?.[0]).toMatchObject({
      url: `${base}/complete`,
      data: JSON.stringify({
        fileId: 'f1',
        parts: [{ partNumber: 1, eTag: '"abc"' }],
      }),
    });
  });

  it('should abort an upload and delete the video', async () => {
    answer(undefined, 204);
    answer(undefined, 204);

    await VideoService.abort(lesson, 'f1');
    await VideoService.delete(lesson);

    expect(
      adapter.mock.calls.map(([config]) => [config.method, config.url]),
    ).toEqual([
      ['post', `${base}/abort`],
      ['delete', base],
    ]);
  });
});
