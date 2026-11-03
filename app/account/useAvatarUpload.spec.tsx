import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAvatarUpload } from '~/account/useAvatarUpload';
import { meQuery } from '~/queries/me';
import { AccountService, type Profile } from '~/services/AccountService';
import { S3Upload } from '~/services/S3Upload';

const before: Profile = {
  id: 'a1',
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  role: 'student',
  avatarUrl: {
    '64': 'https://cdn.test/old-64.webp',
    '256': 'https://cdn.test/old-256.webp',
  },
};
const after: Profile = {
  ...before,
  avatarUrl: {
    '64': 'https://cdn.test/new-64.webp',
    '256': 'https://cdn.test/new-256.webp',
  },
};
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const photo = new File([new Uint8Array(PNG)], 'foto.png', {
  type: 'image/png',
});

let queryClient: QueryClient;

const renderUpload = () =>
  renderHook(() => useAvatarUpload(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

beforeEach(() => {
  vi.useFakeTimers();
  queryClient = new QueryClient();
  queryClient.setQueryData(meQuery.queryKey, before);
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    }),
  );
  vi.spyOn(AccountService, 'requestAvatarUpload').mockResolvedValue({
    fileId: 'f1',
    url: 'https://bucket.test/',
    fields: {},
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAvatarUpload', () => {
  it('should show the local photo, then the processed one when /me has it', async () => {
    vi.spyOn(S3Upload, 'post').mockResolvedValue();
    const getMe = vi
      .spyOn(AccountService, 'getMe')
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(after);
    const { result } = renderUpload();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.upload(photo);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.phase).toEqual({
      step: 'processing',
      preview: 'blob:preview',
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
      await done;
    });

    expect(result.current.phase).toEqual({ step: 'idle' });
    expect(result.current.problem).toBeUndefined();
    expect(queryClient.getQueryData(meQuery.queryKey)).toEqual(after);
    expect(getMe).toHaveBeenCalledTimes(2);
  });

  it('should give up after 20 seconds and say the photo is not ready', async () => {
    vi.spyOn(S3Upload, 'post').mockResolvedValue();
    const getMe = vi.spyOn(AccountService, 'getMe').mockResolvedValue(before);
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(photo);
      await vi.advanceTimersByTimeAsync(20_000);
      await done;
    });

    expect(getMe).toHaveBeenCalledTimes(10);
    expect(result.current.problem).toBe(
      'A foto ainda não ficou pronta. Se ela não aparecer, tente com outra imagem.',
    );
  });

  it('should still look for the photo when S3 gave no answer', async () => {
    vi.spyOn(S3Upload, 'post').mockRejectedValue(
      new AxiosError('Network Error', 'ERR_NETWORK'),
    );
    vi.spyOn(AccountService, 'getMe').mockResolvedValue(before);
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(photo);
      await vi.advanceTimersByTimeAsync(20_000);
      await done;
    });

    expect(result.current.problem).toBe(
      'Não deu para confirmar o envio. Se a foto não aparecer em instantes, tente de novo.',
    );
  });

  it('should ask for the type the bytes have, not the one the name says', async () => {
    vi.spyOn(S3Upload, 'post').mockResolvedValue();
    vi.spyOn(AccountService, 'getMe').mockResolvedValue(after);
    const request = vi.spyOn(AccountService, 'requestAvatarUpload');
    const { result } = renderUpload();

    await act(async () => {
      const done = result.current.upload(
        new File([new Uint8Array(JPEG)], 'foto.png', { type: 'image/png' }),
      );
      await vi.advanceTimersByTimeAsync(2_000);
      await done;
    });

    expect(request).toHaveBeenCalledWith('image/jpeg');
  });

  it('should refuse a file before asking the API', async () => {
    const request = vi.spyOn(AccountService, 'requestAvatarUpload');
    const { result } = renderUpload();

    await act(() =>
      result.current.upload(new File(['gif'], 'a.gif', { type: 'image/gif' })),
    );

    expect(result.current.problem).toBe(
      'Escolha uma imagem JPEG, PNG ou WebP.',
    );
    expect(request).not.toHaveBeenCalled();
  });
});
