import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountService } from '~/services/AccountService';
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

const profile = {
  id: 'account-1',
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  role: 'student',
  createdAt: '2026-11-02T10:00:00.000Z',
  avatarUrl: {
    '64': 'https://cdn.test/64.webp',
    '256': 'https://cdn.test/256.webp',
  },
};

describe('AccountService.getMe', () => {
  it('should ask /me with the signal and keep what the menu reads', async () => {
    answer(profile);
    const { signal } = new AbortController();

    await expect(AccountService.getMe(signal)).resolves.toEqual({
      id: 'account-1',
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      role: 'student',
      avatarUrl: profile.avatarUrl,
    });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({ url: '/me', signal });
  });

  it('should accept an account without an avatar', async () => {
    answer({ ...profile, avatarUrl: undefined });

    const me = await AccountService.getMe();

    expect(me.avatarUrl).toBeUndefined();
  });

  it('should refuse a role it does not know', async () => {
    answer({ ...profile, role: 'owner' });

    await expect(AccountService.getMe()).rejects.toThrow();
  });
});
