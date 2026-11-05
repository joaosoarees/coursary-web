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

const managed = { ...draft, description: 'Sobre gráficos' };

describe('InstructorService course editing', () => {
  it('should read a managed course by id', async () => {
    answer(managed);

    await expect(InstructorService.get('c1')).resolves.toEqual(managed);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/instructor/courses/c1',
    });
  });

  it('should create and update a course with its title and description', async () => {
    const info = { title: 'Gráficos', description: 'Sobre gráficos' };
    answer(managed);
    answer(managed);

    await InstructorService.create(info);
    await InstructorService.update('c1', info);

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      method: 'post',
      url: '/courses',
      data: JSON.stringify(info),
    });
    expect(adapter.mock.calls[1]?.[0]).toMatchObject({
      method: 'patch',
      url: '/courses/c1',
      data: JSON.stringify(info),
    });
  });

  it('should ask for a cover upload and read its status', async () => {
    const post = {
      fileId: 'f1',
      url: 'https://bucket.example/',
      fields: { key: 'k' },
    };
    answer(post);
    answer({ status: 'PROCESSED' });

    await expect(
      InstructorService.requestCoverUpload('c1', 'image/png'),
    ).resolves.toEqual(post);
    await expect(
      InstructorService.getCoverUploadStatus('c1', 'f1'),
    ).resolves.toBe('PROCESSED');
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/cover',
      data: JSON.stringify({ contentType: 'image/png' }),
    });
    expect(adapter.mock.calls[1]?.[0]).toMatchObject({
      url: '/courses/c1/cover/f1',
    });
  });
});
