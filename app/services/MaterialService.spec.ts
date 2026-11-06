import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { MaterialService } from '~/services/MaterialService';

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

const calls = () =>
  adapter.mock.calls.map(([config]): unknown[] => {
    const data: unknown = config.data;

    return [config.method, config.url, data];
  });

describe('MaterialService', () => {
  it('should ask for an upload with the type and the name', async () => {
    const post = { fileId: 'f1', url: 'https://bucket.example/', fields: {} };
    answer(post, 201);

    await expect(
      MaterialService.requestUpload('c1', 'l1', {
        contentType: 'application/pdf',
        fileName: 'guia.pdf',
      }),
    ).resolves.toEqual(post);
    expect(calls()).toEqual([
      [
        'post',
        '/courses/c1/lessons/l1/attachments',
        JSON.stringify({
          contentType: 'application/pdf',
          fileName: 'guia.pdf',
        }),
      ],
    ]);
  });

  it('should delete a file and reorder the rest', async () => {
    const items = [
      { id: 'f2', name: 'b.pdf', contentType: 'application/pdf', size: 10 },
      { id: 'f1', name: 'a.pdf', contentType: 'application/pdf', size: 10 },
    ];
    answer(undefined, 204);
    answer({ items });

    await MaterialService.delete('c1', 'l1', 'f3');
    await expect(
      MaterialService.reorder('c1', 'l1', ['f2', 'f1']),
    ).resolves.toEqual(items);
    expect(calls()).toEqual([
      ['delete', '/courses/c1/lessons/l1/attachments/f3', undefined],
      [
        'put',
        '/courses/c1/lessons/l1/attachments/order',
        JSON.stringify({ fileIds: ['f2', 'f1'] }),
      ],
    ]);
  });
});
