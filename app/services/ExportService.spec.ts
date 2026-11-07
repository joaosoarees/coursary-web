import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExportService } from '~/services/ExportService';
import { httpClient } from '~/services/httpClient';

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

const pending = {
  id: 'e1',
  courseId: 'c1',
  status: 'PENDING',
  createdAt: '2026-11-07T12:00:00.000Z',
  rowCount: null,
};

describe('ExportService', () => {
  it('should ask for a CSV of the course students', async () => {
    answer(pending, 202);

    await expect(ExportService.request('c1')).resolves.toEqual(pending);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      method: 'post',
      url: '/courses/c1/exports',
    });
  });

  it('should read a ready export with its download address', async () => {
    const ready = {
      ...pending,
      status: 'READY',
      rowCount: 47,
      downloadUrl: 'https://bucket.example/exports/c1/e1.csv',
      expiresIn: 300,
    };
    answer(ready);

    await expect(ExportService.get('e1')).resolves.toEqual(ready);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({ url: '/exports/e1' });
  });

  it('should refuse a status it does not know', async () => {
    answer({ ...pending, status: 'RUNNING' });

    await expect(ExportService.get('e1')).rejects.toThrow();
  });
});
