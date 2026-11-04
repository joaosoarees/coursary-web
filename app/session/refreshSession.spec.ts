import { AxiosError, AxiosHeaders } from 'axios';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { AuthService } from '~/services/AuthService';
import {
  ensureSession,
  refreshSession,
  restoreSession,
} from '~/session/refreshSession';
import {
  endSession,
  getAccessToken,
  isSignedIn,
  startSession,
} from '~/session/session';

let refresh: MockInstance<typeof AuthService.refresh>;

const failure = (status: number) =>
  new AxiosError('failed', String(status), undefined, undefined, {
    data: {},
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

beforeEach(() => {
  refresh = vi.spyOn(AuthService, 'refresh');
  refresh.mockResolvedValue({ accessToken: 'new', expiresIn: 3600 });
});

afterEach(() => {
  endSession();
});

describe('refreshSession', () => {
  it('should start the session with the new access token', async () => {
    await refreshSession();

    expect(getAccessToken()).toBe('new');
  });

  it('should share one refresh between callers', async () => {
    await Promise.all([refreshSession(), refreshSession()]);

    expect(refresh).toHaveBeenCalledOnce();
  });

  it('should run the refresh under a lock shared by the tabs', async () => {
    const request = vi.fn((_name: string, task: () => Promise<unknown>) =>
      task(),
    );
    vi.stubGlobal('navigator', { locks: { request } });

    await refreshSession();

    expect(request).toHaveBeenCalledWith(
      'coursary:refresh',
      expect.any(Function),
    );
  });

  it.each([400, 401, 403])(
    'should end the session when the refresh is refused with %i',
    async (status) => {
      startSession('old');
      refresh.mockRejectedValue(failure(status));

      await expect(refreshSession()).rejects.toThrow();

      expect(isSignedIn()).toBe(false);
    },
  );

  it.each([408, 429, 503])(
    'should keep the session when the refresh fails with %i',
    async (status) => {
      startSession('old');
      refresh.mockRejectedValue(failure(status));

      await expect(refreshSession()).rejects.toThrow();

      expect(getAccessToken()).toBe('old');
    },
  );

  it('should drop an answer that arrives after the session ended', async () => {
    startSession('old');
    let answer: () => void = () => undefined;
    refresh.mockReturnValue(
      new Promise((resolve) => {
        answer = () => {
          resolve({ accessToken: 'new', expiresIn: 3600 });
        };
      }),
    );

    const refreshing = refreshSession();
    endSession();
    answer();

    await expect(refreshing).rejects.toThrow('The session ended');
    expect(isSignedIn()).toBe(false);
  });
});

describe('restoreSession', () => {
  it('should answer whether a session was restored', async () => {
    await expect(restoreSession()).resolves.toBe(true);

    refresh.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));
    endSession();

    await expect(restoreSession()).resolves.toBe(false);
  });
});

describe('ensureSession', () => {
  it('should keep a session it holds and restore one it does not', async () => {
    startSession('held');

    await expect(ensureSession()).resolves.toBe(true);
    expect(refresh).not.toHaveBeenCalled();

    endSession();

    await expect(ensureSession()).resolves.toBe(true);
    expect(refresh).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBe('new');
  });
});
