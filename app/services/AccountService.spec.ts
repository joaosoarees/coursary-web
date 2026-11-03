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

describe('AccountService.updateMe', () => {
  it('should patch the name and read the profile back', async () => {
    answer({ ...profile, name: 'Ana Lima' });

    await expect(AccountService.updateMe('Ana Lima')).resolves.toMatchObject({
      name: 'Ana Lima',
    });
    const [config] = adapter.mock.calls[0] ?? [];
    expect(config).toMatchObject({ method: 'patch', url: '/me' });
    expect(config?.data).toBe(JSON.stringify({ name: 'Ana Lima' }));
  });
});

describe('AccountService.requestAvatarUpload', () => {
  it('should ask for a signed form for the file type', async () => {
    answer({
      fileId: 'file-1',
      url: 'https://bucket.s3.amazonaws.com/',
      fields: { key: 'account/a/avatar/f/original', Policy: 'p' },
    });

    await expect(
      AccountService.requestAvatarUpload('image/png'),
    ).resolves.toMatchObject({ fileId: 'file-1' });
    const [config] = adapter.mock.calls[0] ?? [];
    expect(config).toMatchObject({ method: 'post', url: '/me/avatar' });
    expect(config?.data).toBe(JSON.stringify({ contentType: 'image/png' }));
  });

  it('should refuse an answer without a URL', async () => {
    answer({ fileId: 'file-1', url: 'not a url', fields: {} });

    await expect(
      AccountService.requestAvatarUpload('image/png'),
    ).rejects.toThrow();
  });
});

describe('AccountService.getAvatarUploadStatus', () => {
  it('should read the status of the upload by its file id', async () => {
    answer({ status: 'PROCESSED' });

    await expect(AccountService.getAvatarUploadStatus('file-1')).resolves.toBe(
      'PROCESSED',
    );
    const [config] = adapter.mock.calls[0] ?? [];
    expect(config).toMatchObject({ method: 'get', url: '/me/avatar/file-1' });
  });
});
