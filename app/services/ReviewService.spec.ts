import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { ReviewService } from '~/services/ReviewService';
import { apiError } from '~/test/renderRoutes';

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

// As ReviewDetails of the API sends it.
const review = {
  courseId: 'c1',
  rating: 4,
  comment: 'Bom curso.',
  createdAt: '2026-11-04T12:00:00.000Z',
  updatedAt: '2026-11-04T12:00:00.000Z',
};

describe('ReviewService.mine', () => {
  it('should read the student review of the course', async () => {
    answer(review);

    await expect(ReviewService.mine('c1')).resolves.toEqual(review);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/review',
    });
  });

  it('should read the 404 as no review yet', async () => {
    adapter.mockRejectedValueOnce(apiError(404, 'REVIEW_NOT_FOUND'));

    await expect(ReviewService.mine('c1')).resolves.toBeNull();
  });

  it('should let any other failure through', async () => {
    adapter.mockRejectedValueOnce(apiError(500, 'INTERNAL'));

    await expect(ReviewService.mine('c1')).rejects.toThrow();
  });
});

describe('ReviewService.save', () => {
  it('should send the rating and the comment', async () => {
    answer(review, 201);

    await expect(
      ReviewService.save({ courseId: 'c1', rating: 4, comment: 'Bom curso.' }),
    ).resolves.toEqual(review);
    const config = adapter.mock.calls[0]?.[0];
    expect(config).toMatchObject({ method: 'put', url: '/courses/c1/review' });
    expect(JSON.parse(String(config?.data))).toEqual({
      rating: 4,
      comment: 'Bom curso.',
    });
  });
});
