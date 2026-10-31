import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet, apiRequest, refreshSession, restoreSession } from '~/lib/api';
import { ApiError } from '~/lib/apiError';
import {
  endSession,
  getAccessToken,
  getSessionStatus,
  startSession,
} from '~/session/session';

const fetchMock = vi.fn<typeof fetch>();

const tokens = (accessToken: string) =>
  Response.json({ accessToken, expiresIn: 3600 });

const unauthorized = () =>
  Response.json({ error: { code: 'INVALID_SESSION' } }, { status: 401 });

const headersOf = (call: number) =>
  fetchMock.mock.calls[call]?.[1]?.headers as Record<string, string>;

const urlOf = (call: number) => fetchMock.mock.calls[call]?.[0] as string;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  endSession();
});

describe('apiGet', () => {
  it('should send the session cookie and the abort signal', async () => {
    fetchMock.mockResolvedValue(Response.json({ status: 'ok' }));
    const { signal } = new AbortController();

    await apiGet('/health', { signal });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/health$/),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        signal,
      }),
    );
  });

  it('should answer the parsed body', async () => {
    fetchMock.mockResolvedValue(Response.json({ status: 'ok' }));

    await expect(apiGet('/health')).resolves.toEqual({ status: 'ok' });
  });

  it("should fail with the API's error code", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ error: { code: 'FORBIDDEN' } }, { status: 403 }),
    );

    await expect(apiGet('/x')).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });
  });

  it('should fail with the HTTP status when the body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 502 }));

    const error = await apiGet('/x').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 502,
      code: undefined,
      message: 'HTTP 502',
    });
  });
});

describe('apiRequest', () => {
  it('should send the body as JSON', async () => {
    fetchMock.mockResolvedValue(Response.json({ id: '1' }, { status: 201 }));

    await apiRequest('/courses', { method: 'POST', body: { title: 'x' } });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/courses$/),
      expect.objectContaining({ method: 'POST', body: '{"title":"x"}' }),
    );
    expect(headersOf(0)).toEqual({ 'Content-Type': 'application/json' });
  });

  it('should answer nothing for a 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      apiRequest('/auth/sign-out', { method: 'POST' }),
    ).resolves.toBeUndefined();
  });

  it('should send the access token while signed in', async () => {
    startSession('token-1');
    fetchMock.mockResolvedValue(Response.json({}));

    await apiGet('/me');

    expect(headersOf(0).Authorization).toBe('Bearer token-1');
  });

  it('should refresh once and repeat the call after a 401', async () => {
    startSession('old');
    fetchMock
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(tokens('new'))
      .mockResolvedValueOnce(Response.json({ name: 'Ada' }));

    await expect(apiGet('/me')).resolves.toEqual({ name: 'Ada' });

    expect(urlOf(1)).toMatch(/\/auth\/refresh$/);
    expect(headersOf(2).Authorization).toBe('Bearer new');
    expect(getAccessToken()).toBe('new');
  });

  it('should share one refresh between calls that fail together', async () => {
    startSession('old');
    fetchMock.mockImplementation((input, init) => {
      const url = input as string;
      const headers = init?.headers as Record<string, string>;

      if (url.endsWith('/auth/refresh')) {
        return Promise.resolve(tokens('new'));
      }

      return Promise.resolve(
        headers.Authorization === 'Bearer new'
          ? Response.json({ url })
          : unauthorized(),
      );
    });

    await Promise.all([apiGet('/me'), apiGet('/me/enrollments')]);

    const refreshes = fetchMock.mock.calls.filter(([input]) =>
      (input as string).endsWith('/auth/refresh'),
    );
    expect(refreshes).toHaveLength(1);
  });

  it('should end the session when the refresh is refused', async () => {
    startSession('old');
    fetchMock
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(unauthorized());

    await expect(apiGet('/me')).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getSessionStatus()).toBe('signed-out');
  });

  it('should not refresh after a 401 to a call made signed out', async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: 'INVALID_CREDENTIALS' } },
        { status: 401 },
      ),
    );

    await expect(
      apiRequest('/auth/sign-in', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe('refreshSession', () => {
  it('should keep the session when the API fails to answer', async () => {
    startSession('old');
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(refreshSession()).rejects.toMatchObject({ status: 503 });

    expect(getAccessToken()).toBe('old');
  });

  it('should not start a session that ended while it was refreshing', async () => {
    startSession('old');
    let answer: (response: Response) => void = () => undefined;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );

    const refreshing = refreshSession();
    endSession();
    answer(tokens('new'));

    await expect(refreshing).resolves.toBe(false);
    expect(getSessionStatus()).toBe('signed-out');
  });

  it('should start the session with the new access token', async () => {
    fetchMock.mockResolvedValue(tokens('token-1'));

    await expect(refreshSession()).resolves.toBe(true);

    expect(urlOf(0)).toMatch(/\/auth\/refresh$/);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
    });
    expect(getAccessToken()).toBe('token-1');
  });
});

describe('restoreSession', () => {
  it('should answer signed out when the API cannot be reached', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(restoreSession()).resolves.toBe(false);

    expect(getSessionStatus()).toBe('signed-out');
  });
});
