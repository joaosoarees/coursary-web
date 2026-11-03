import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CourseService } from '~/services/CourseService';
import { httpClient } from '~/services/httpClient';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status: 200, statusText: '', headers: {}, config }),
  );

const page = {
  id: 'c1',
  title: 'Python para análise de dados',
  description: 'Do primeiro notebook a um relatório.',
  instructorName: 'Juliana Prado',
  lessonCount: 1,
  enrollmentCount: 221,
  ratingCount: 36,
  ratingAverage: 4.8,
  publishedAt: '2026-10-01T00:00:00.000Z',
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

describe('CourseService.get', () => {
  it('should read the course page with its outline', async () => {
    answer(page);

    await expect(CourseService.get('c1')).resolves.toEqual(page);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({ url: '/courses/c1' });
  });

  it('should keep an id from changing the path', async () => {
    answer(page);

    await CourseService.get('../me');

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/..%2Fme',
    });
  });
});

describe('CourseService.listReviews', () => {
  it('should ask for a page of reviews by cursor', async () => {
    const review = {
      studentName: 'Ana Souza',
      rating: 5,
      comment: 'Ótimo.',
      createdAt: '2026-10-28T00:00:00.000Z',
      updatedAt: '2026-10-28T00:00:00.000Z',
    };
    answer({ items: [review], nextCursor: null });

    await expect(
      CourseService.listReviews({ courseId: 'c1', cursor: 'abc', limit: 10 }),
    ).resolves.toEqual({ items: [review], nextCursor: null });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/reviews',
      params: { cursor: 'abc', limit: 10 },
    });
  });
});
