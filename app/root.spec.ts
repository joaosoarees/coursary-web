import type { AxiosAdapter } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clientLoader, shouldRevalidate } from '~/root';
import { httpClient } from '~/services/httpClient';
import { ensureSession } from '~/session/refreshSession';
import { endSession, startSession } from '~/session/session';

vi.mock('~/session/refreshSession', () => ({
  refreshSession: vi.fn(),
  ensureSession: vi.fn(() => Promise.resolve(false)),
}));

afterEach(() => {
  endSession();
});

describe('root', () => {
  it('should restore the session before the site renders', async () => {
    await expect(clientLoader()).resolves.toBeNull();

    expect(ensureSession).toHaveBeenCalledOnce();
  });

  it('should not run again on a click to the address already open', () => {
    expect(shouldRevalidate()).toBe(false);
  });

  it('should send the access token on every API call', async () => {
    const adapter = vi.fn<AxiosAdapter>((config) =>
      Promise.resolve({
        data: {},
        status: 200,
        statusText: '',
        headers: {},
        config,
      }),
    );
    startSession('token-1');

    await httpClient.get('/me', { adapter });

    expect(adapter.mock.calls[0]?.[0].headers.get('Authorization')).toBe(
      'Bearer token-1',
    );
  });
});
