import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { Retry } from '~/services/multipart/Retry';
import { S3PartError } from '~/services/multipart/S3Part';

const axiosError = (status?: number) => {
  const response =
    status === undefined
      ? undefined
      : {
          status,
          statusText: '',
          headers: {},
          config: { headers: new AxiosHeaders() },
          data: undefined,
        };

  return new AxiosError('failed', undefined, undefined, undefined, response);
};

const noWait = () => Promise.resolve();

describe('Retry.isTransient', () => {
  it('should retry no answer and a 5xx, never a 4xx', () => {
    expect(Retry.isTransient(new S3PartError(0, ''))).toBe(true);
    expect(Retry.isTransient(new S3PartError(503, ''))).toBe(true);
    expect(Retry.isTransient(new S3PartError(403, ''))).toBe(false);
    expect(Retry.isTransient(axiosError())).toBe(true);
    expect(Retry.isTransient(axiosError(502))).toBe(true);
    expect(Retry.isTransient(axiosError(400))).toBe(false);
    expect(Retry.isTransient(new Error('bug'))).toBe(false);
  });

  it('should not retry a request the page cancelled', () => {
    const cancelled = new AxiosError('canceled', AxiosError.ERR_CANCELED);

    expect(Retry.isTransient(cancelled)).toBe(false);
  });
});

describe('Retry.backoffMs', () => {
  it('should grow from the base and stop at the cap', () => {
    const top = () => 1;

    expect(Retry.backoffMs(0, 1000, 20_000, top)).toBe(1000);
    expect(Retry.backoffMs(3, 1000, 20_000, top)).toBe(8000);
    expect(Retry.backoffMs(9, 1000, 20_000, top)).toBe(20_000);
    expect(Retry.backoffMs(3, 1000, 20_000, () => 0.25)).toBe(2000);
  });
});

describe('Retry.run', () => {
  it('should try a passing failure again until it works', async () => {
    const task = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new S3PartError(0, ''))
      .mockRejectedValueOnce(new S3PartError(503, ''))
      .mockResolvedValue('"etag"');

    await expect(Retry.run(task, { wait: noWait })).resolves.toBe('"etag"');
    expect(task).toHaveBeenCalledTimes(3);
  });

  it('should give up after the attempts and on a refusal at once', async () => {
    const offline = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue(new S3PartError(0, ''));
    const refused = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue(new S3PartError(403, ''));

    await expect(
      Retry.run(offline, { attempts: 4, wait: noWait }),
    ).rejects.toMatchObject({ status: 0 });
    await expect(Retry.run(refused, { wait: noWait })).rejects.toMatchObject({
      status: 403,
    });
    expect(offline).toHaveBeenCalledTimes(4);
    expect(refused).toHaveBeenCalledTimes(1);
  });

  it('should end a wait at once when cancelled', async () => {
    const stop = new AbortController();
    const reason = new DOMException('Cancelled.', 'AbortError');
    const task = vi
      .fn<() => Promise<string>>()
      .mockRejectedValue(new S3PartError(0, ''));
    const running = Retry.run(task, { signal: stop.signal, random: () => 1 });

    await vi.waitFor(() => {
      expect(task).toHaveBeenCalledTimes(1);
    });
    stop.abort(reason);

    await expect(running).rejects.toBe(reason);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
