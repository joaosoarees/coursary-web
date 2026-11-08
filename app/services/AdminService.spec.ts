import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type AccountSummary, AdminService } from '~/services/AdminService';
import { httpClient } from '~/services/httpClient';
import { apiError } from '~/test/renderRoutes';

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

const account: AccountSummary = {
  id: 'a1',
  name: 'Beatriz Nakamura',
  email: 'beatriz@exemplo.com',
  role: 'student',
  status: 'ACTIVE',
  createdAt: '2026-11-06T12:00:00.000Z',
};

describe('AdminService.list', () => {
  it('should read a page of the accounts with a role and a status', async () => {
    answer({ items: [account], nextCursor: 'n2' });

    await expect(
      AdminService.list({
        role: 'student',
        status: 'PENDING',
        cursor: 'n1',
        limit: 20,
      }),
    ).resolves.toEqual({ items: [account], nextCursor: 'n2' });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/admin/users',
      params: { role: 'student', status: 'PENDING', cursor: 'n1', limit: 20 },
    });
  });

  it('should refuse a status it does not know', async () => {
    answer({ items: [{ ...account, status: 'BANNED' }], nextCursor: null });

    await expect(
      AdminService.list({
        role: 'student',
        status: undefined,
        cursor: undefined,
        limit: 20,
      }),
    ).rejects.toThrow();
  });
});

describe('AdminService.findByEmail', () => {
  it('should read the account with the e-mail', async () => {
    answer(account);

    await expect(
      AdminService.findByEmail('beatriz@exemplo.com'),
    ).resolves.toEqual(account);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/admin/users/by-email',
      params: { email: 'beatriz@exemplo.com' },
    });
  });

  it('should answer null when no account has the e-mail', async () => {
    adapter.mockRejectedValueOnce(apiError(404, 'ACCOUNT_NOT_FOUND'));

    await expect(
      AdminService.findByEmail('ninguem@exemplo.com'),
    ).resolves.toBeNull();
  });

  it('should pass any other failure on', async () => {
    adapter.mockRejectedValueOnce(apiError(403, 'FORBIDDEN'));

    await expect(
      AdminService.findByEmail('beatriz@exemplo.com'),
    ).rejects.toThrow();
  });
});
