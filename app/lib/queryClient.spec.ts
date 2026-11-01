import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { queryClient } from '~/lib/queryClient';

const retry = queryClient.getDefaultOptions().queries?.retry as (
  failureCount: number,
  error: Error,
) => boolean;

const answered = (status: number) =>
  new AxiosError('failed', undefined, undefined, undefined, {
    data: {},
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('queryClient', () => {
  it('should retry a server error and a network failure', () => {
    expect(retry(0, answered(503))).toBe(true);
    expect(retry(0, new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(true);
  });

  it('should not retry an answer that would come back the same', () => {
    expect(retry(0, answered(401))).toBe(false);
    expect(retry(0, answered(404))).toBe(false);
    expect(retry(0, z.string().safeParse(1).error ?? new Error())).toBe(false);
  });

  it('should stop after three retries', () => {
    expect(retry(3, answered(503))).toBe(false);
  });
});
