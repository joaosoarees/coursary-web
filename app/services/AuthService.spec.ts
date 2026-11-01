import axios, { type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '~/services/AuthService';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = axios.defaults.adapter;

beforeEach(() => {
  axios.defaults.adapter = adapter;
});

afterEach(() => {
  axios.defaults.adapter = defaultAdapter;
});

const answer = (status: number, data: unknown) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

describe('AuthService.refresh', () => {
  it('should post to the refresh route with the cookie and a timeout', async () => {
    answer(200, { accessToken: 'token-1', expiresIn: 3600 });

    await expect(AuthService.refresh()).resolves.toEqual({
      accessToken: 'token-1',
      expiresIn: 3600,
    });

    const [config] = adapter.mock.calls[0] ?? [];
    expect(config).toMatchObject({
      method: 'post',
      withCredentials: true,
      timeout: 10_000,
    });
    expect(config?.url).toMatch(/\/auth\/refresh$/);
  });

  it('should refuse an answer without an access token', async () => {
    answer(200, { expiresIn: 3600 });

    await expect(AuthService.refresh()).rejects.toThrow();
  });
});
