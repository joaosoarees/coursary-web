import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiGet } from '~/lib/api';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('apiGet', () => {
  it('should send the session cookie and the abort signal', async () => {
    fetchMock.mockResolvedValue(Response.json({ status: 'ok' }));
    const { signal } = new AbortController();

    await apiGet('/health', { signal });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/health$/), {
      credentials: 'include',
      signal,
    });
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
