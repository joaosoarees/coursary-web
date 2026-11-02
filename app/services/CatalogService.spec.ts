import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogService } from '~/services/CatalogService';
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

const course = {
  id: 'c1',
  title: 'Python para análise de dados',
  instructorName: 'Juliana Prado',
  lessonCount: 10,
  enrollmentCount: 221,
  ratingCount: 36,
  ratingAverage: 4.8,
  publishedAt: '2026-10-01T00:00:00.000Z',
};

describe('CatalogService.list', () => {
  it('should ask for a page of the catalog by cursor', async () => {
    answer({ items: [course], nextCursor: 'next' });
    const { signal } = new AbortController();

    await expect(
      CatalogService.list({ cursor: 'abc', limit: 12 }, signal),
    ).resolves.toEqual({ items: [course], nextCursor: 'next' });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses',
      params: { cursor: 'abc', limit: 12 },
      signal,
    });
  });

  it('should refuse a page without its cursor field', async () => {
    answer({ items: [course] });

    await expect(
      CatalogService.list({ cursor: undefined, limit: 12 }),
    ).rejects.toThrow();
  });
});

describe('CatalogService.search', () => {
  it('should send the words as q and read the page count', async () => {
    answer({ items: [course], page: 1, totalPages: 7, totalItems: 80 });

    await expect(
      CatalogService.search({ query: 'dados', page: 1, perPage: 12 }),
    ).resolves.toMatchObject({ page: 1, totalPages: 7 });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/search',
      params: { q: 'dados', page: 1, perPage: 12 },
    });
  });
});
