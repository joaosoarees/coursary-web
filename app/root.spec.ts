import type { AxiosAdapter } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clientLoader } from '~/root';
import { httpClient } from '~/services/httpClient';
import { restoreSession } from '~/session/refreshSession';
import { endSession, startSession } from '~/session/session';

vi.mock('~/session/refreshSession', () => ({
  refreshSession: vi.fn(),
  restoreSession: vi.fn(() => Promise.resolve(false)),
}));

afterEach(() => {
  endSession();
});

describe('root', () => {
  it('should restore the session before the site renders', async () => {
    await expect(clientLoader()).resolves.toBeNull();

    expect(restoreSession).toHaveBeenCalledOnce();
  });

  it('should keep the session it has when the loader runs again', async () => {
    startSession('token-1');

    await clientLoader();

    expect(restoreSession).not.toHaveBeenCalled();
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
