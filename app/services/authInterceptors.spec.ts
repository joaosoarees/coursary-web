import axios, {
  type AxiosAdapter,
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installAuthInterceptors } from '~/services/authInterceptors';
import { refreshSession } from '~/session/refreshSession';
import { endSession, isSignedIn, startSession } from '~/session/session';

vi.mock('~/session/refreshSession', () => ({ refreshSession: vi.fn() }));

const refreshMock = vi.mocked(refreshSession);
const adapter = vi.fn<AxiosAdapter>();
const client = axios.create({ adapter });
let uninstall: () => void;

const respond = (config: InternalAxiosRequestConfig, status: number) => {
  const response = { data: {}, status, statusText: '', headers: {}, config };

  return status < 400
    ? Promise.resolve(response)
    : Promise.reject(
        new AxiosError('failed', undefined, config, undefined, response),
      );
};

const authorizationOf = (call: number) =>
  adapter.mock.calls[call]?.[0].headers.get('Authorization');

beforeEach(() => {
  uninstall = installAuthInterceptors(client);
  refreshMock.mockImplementation(() => {
    startSession('new');
    return Promise.resolve();
  });
});

afterEach(() => {
  uninstall();
  endSession();
});

describe('installAuthInterceptors', () => {
  it('should send the access token only while signed in', async () => {
    adapter.mockImplementation((config) => respond(config, 200));

    await client.get('/health');
    startSession('token-1');
    await client.get('/me');

    expect(authorizationOf(0)).toBeUndefined();
    expect(authorizationOf(1)).toBe('Bearer token-1');
  });

  it('should refresh once and repeat the call after a 401', async () => {
    startSession('old');
    adapter
      .mockImplementationOnce((config) => respond(config, 401))
      .mockImplementationOnce((config) => respond(config, 200));

    await expect(client.get('/me')).resolves.toMatchObject({ status: 200 });

    expect(refreshMock).toHaveBeenCalledOnce();
    expect(authorizationOf(1)).toBe('Bearer new');
  });

  it('should repeat without refreshing when the token changed meanwhile', async () => {
    startSession('old');
    adapter
      .mockImplementationOnce((config) => {
        startSession('renewed');
        return respond(config, 401);
      })
      .mockImplementationOnce((config) => respond(config, 200));

    await client.get('/me');

    expect(refreshMock).not.toHaveBeenCalled();
    expect(authorizationOf(1)).toBe('Bearer renewed');
  });

  it('should end the session when the repeated call is refused again', async () => {
    startSession('old');
    adapter
      .mockImplementationOnce((config) => respond(config, 401))
      .mockImplementationOnce((config) => respond(config, 401))
      .mockImplementation((config) => respond(config, 200));

    await expect(client.get('/me')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshMock).toHaveBeenCalledOnce();
    expect(isSignedIn()).toBe(false);
  });

  it('should not refresh after a 401 to a call made signed out', async () => {
    adapter.mockImplementation((config) => respond(config, 401));

    await expect(client.post('/auth/sign-in', {})).rejects.toThrow();

    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('should not refresh a call sent in a session that has ended', async () => {
    startSession('first');
    adapter.mockImplementationOnce((config) => {
      endSession();
      startSession('second');
      return respond(config, 401);
    });

    await expect(client.get('/me')).rejects.toThrow();

    expect(refreshMock).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledOnce();
  });

  it('should pass other failures on untouched', async () => {
    startSession('token-1');
    adapter.mockImplementation((config) => respond(config, 404));

    await expect(client.get('/courses/x')).rejects.toMatchObject({
      response: { status: 404 },
    });
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('should remove both interceptors when uninstalled', async () => {
    startSession('token-1');
    uninstall();
    adapter.mockImplementation((config) => respond(config, 200));

    await client.get('/me');

    expect(authorizationOf(0)).toBeUndefined();
    uninstall = () => undefined;
  });
});
