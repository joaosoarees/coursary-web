import { describe, expect, it } from 'vitest';

import { ApiError } from '~/lib/apiError';
import { queryClient } from '~/lib/queryClient';

const retry = queryClient.getDefaultOptions().queries?.retry as (
  failureCount: number,
  error: Error,
) => boolean;

describe('queryClient', () => {
  it('should retry a server error and a network failure', () => {
    expect(retry(0, new ApiError(503, undefined))).toBe(true);
    expect(retry(0, new TypeError('Failed to fetch'))).toBe(true);
  });

  it('should not retry an answer that would come back the same', () => {
    expect(retry(0, new ApiError(401, 'INVALID_SESSION'))).toBe(false);
    expect(retry(0, new ApiError(404, 'NOT_FOUND'))).toBe(false);
  });

  it('should stop after three retries', () => {
    expect(retry(3, new ApiError(503, undefined))).toBe(false);
  });
});
