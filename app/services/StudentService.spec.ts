import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { StudentService } from '~/services/StudentService';

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

const student = {
  accountId: 'a1',
  studentName: 'Larissa Monteiro',
  enrolledAt: '2026-11-06T12:00:00.000Z',
  completedLessons: 3,
};

describe('StudentService.list', () => {
  it('should read a page of the course students in the asked order', async () => {
    answer({ items: [student], nextCursor: 'n2' });

    await expect(
      StudentService.list('c1', { cursor: 'n1', limit: 20, order: 'asc' }),
    ).resolves.toEqual({ items: [student], nextCursor: 'n2' });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/students',
      params: { cursor: 'n1', limit: 20, order: 'asc' },
    });
  });

  it('should refuse a student without a name', async () => {
    answer({ items: [{ ...student, studentName: null }], nextCursor: null });

    await expect(
      StudentService.list('c1', {
        cursor: undefined,
        limit: 20,
        order: 'desc',
      }),
    ).rejects.toThrow();
  });
});
