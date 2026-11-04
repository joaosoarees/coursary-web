import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { LessonService } from '~/services/LessonService';

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

describe('LessonService.outline', () => {
  it('should read the outline with the course title and status', async () => {
    const outline = {
      courseId: 'c1',
      title: 'Python para análise de dados',
      status: 'ARCHIVED',
      modules: [
        {
          id: 'm1',
          title: 'Primeiros passos',
          position: 0,
          lessons: [
            { id: 'l1', title: 'Instalando', durationMinutes: 8, position: 0 },
          ],
        },
      ],
    };
    answer(outline);

    await expect(LessonService.outline('c1')).resolves.toEqual(outline);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/outline',
    });
  });
});

describe('LessonService.open', () => {
  it('should read the lesson with its material and video', async () => {
    const lesson = {
      lessonId: 'l1',
      courseId: 'c1',
      body: '# Olá',
      attachments: [
        {
          id: 'f1',
          name: 'guia.pdf',
          contentType: 'application/pdf',
          size: 10,
        },
      ],
      video: { url: 'https://files.test/v.mp4', expiresIn: 7200 },
    };
    answer(lesson);

    await expect(
      LessonService.open({ courseId: 'c1', lessonId: 'l1' }),
    ).resolves.toEqual(lesson);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/lessons/l1',
    });
  });

  it('should read a lesson without video', async () => {
    answer({ lessonId: 'l1', courseId: 'c1', body: '', attachments: [] });

    await expect(
      LessonService.open({ courseId: 'c1', lessonId: 'l1' }),
    ).resolves.not.toHaveProperty('video');
  });
});

describe('LessonService.attachmentDownload', () => {
  it('should ask for the download address of one file', async () => {
    answer({ url: 'https://files.test/guia.pdf', expiresIn: 300 });

    await expect(
      LessonService.attachmentDownload({
        courseId: 'c1',
        lessonId: 'l1',
        fileId: 'f1',
      }),
    ).resolves.toEqual({ url: 'https://files.test/guia.pdf', expiresIn: 300 });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/lessons/l1/attachments/f1',
    });
  });
});
