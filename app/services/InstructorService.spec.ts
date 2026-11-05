import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { InstructorService } from '~/services/InstructorService';

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

const draft = {
  id: 'c1',
  title: 'Gráficos que contam uma história',
  status: 'DRAFT',
  lessonCount: 0,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
};

describe('InstructorService.listMine', () => {
  it('should read a page of the caller courses', async () => {
    answer({ items: [draft], nextCursor: 'n2' });

    await expect(
      InstructorService.listMine({ cursor: 'n1', limit: 12 }),
    ).resolves.toEqual({ items: [draft], nextCursor: 'n2' });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/instructor/courses',
      params: { cursor: 'n1', limit: 12 },
    });
  });

  it('should refuse a status it does not know', async () => {
    answer({ items: [{ ...draft, status: 'DELETING' }], nextCursor: null });

    await expect(
      InstructorService.listMine({ cursor: undefined, limit: 12 }),
    ).rejects.toThrow();
  });
});
