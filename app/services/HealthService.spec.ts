import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthService } from '~/services/HealthService';
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

describe('HealthService.get', () => {
  it('should ask /health with the signal', async () => {
    answer({ status: 'ok' });
    const { signal } = new AbortController();

    await expect(HealthService.get(signal)).resolves.toEqual({ status: 'ok' });

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/health',
      signal,
    });
  });

  it('should refuse a body of another shape', async () => {
    answer({ status: 'down' });

    await expect(HealthService.get()).rejects.toThrow();
  });
});
