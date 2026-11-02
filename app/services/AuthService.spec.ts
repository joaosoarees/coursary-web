import axios, { type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '~/services/AuthService';
import { httpClient } from '~/services/httpClient';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = axios.defaults.adapter;
const defaultClientAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  axios.defaults.adapter = adapter;
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  axios.defaults.adapter = defaultAdapter;
  httpClient.defaults.adapter = defaultClientAdapter;
});

const answer = (status: number, data: unknown) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

const sent = () => {
  const [config] = adapter.mock.calls[0] ?? [];

  return {
    method: config?.method,
    url: config?.url,
    body:
      typeof config?.data === 'string'
        ? (JSON.parse(config.data) as unknown)
        : undefined,
  };
};

describe('AuthService.signIn', () => {
  it('should post the credentials and read the access token', async () => {
    answer(200, { accessToken: 'token-1', expiresIn: 3600 });

    await expect(
      AuthService.signIn({ email: 'ana@exemplo.com', password: 'violao2026' }),
    ).resolves.toEqual({ accessToken: 'token-1', expiresIn: 3600 });
    expect(sent()).toEqual({
      method: 'post',
      url: '/auth/sign-in',
      body: { email: 'ana@exemplo.com', password: 'violao2026' },
    });
  });

  it('should refuse an answer without an access token', async () => {
    answer(200, {});

    await expect(
      AuthService.signIn({ email: 'ana@exemplo.com', password: 'x' }),
    ).rejects.toThrow();
  });
});

describe('AuthService routes without an answer body', () => {
  it.each([
    [
      'signUp',
      () =>
        AuthService.signUp({
          name: 'Ana',
          email: 'ana@exemplo.com',
          password: 'violao2026',
        }),
      '/auth/sign-up',
      { name: 'Ana', email: 'ana@exemplo.com', password: 'violao2026' },
    ],
    [
      'confirmSignUp',
      () =>
        AuthService.confirmSignUp({ email: 'ana@exemplo.com', code: '482913' }),
      '/auth/confirm',
      { email: 'ana@exemplo.com', code: '482913' },
    ],
    [
      'resendConfirmationCode',
      () => AuthService.resendConfirmationCode('ana@exemplo.com'),
      '/auth/resend-code',
      { email: 'ana@exemplo.com' },
    ],
    [
      'forgotPassword',
      () => AuthService.forgotPassword('ana@exemplo.com'),
      '/auth/forgot-password',
      { email: 'ana@exemplo.com' },
    ],
    [
      'resetPassword',
      () =>
        AuthService.resetPassword({
          email: 'ana@exemplo.com',
          code: '482913',
          newPassword: 'violao2026',
        }),
      '/auth/reset-password',
      { email: 'ana@exemplo.com', code: '482913', newPassword: 'violao2026' },
    ],
  ])('%s should post its body', async (_name, call, url, body) => {
    answer(204, '');

    await expect(call()).resolves.toBeUndefined();
    expect(sent()).toEqual({ method: 'post', url, body });
  });

  it('signOut should post to the sign-out route', async () => {
    answer(204, '');

    await AuthService.signOut();

    expect(sent()).toMatchObject({ method: 'post', url: '/auth/sign-out' });
  });
});

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
