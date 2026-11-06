import { isAxiosError } from 'axios';

import { S3PartError } from '~/services/multipart/S3Part';

export interface RetryOptions {
  // In all, the first one included.
  attempts?: number;
  baseMs?: number;
  capMs?: number;
  signal?: AbortSignal;
  wait?: (ms: number, signal?: AbortSignal) => Promise<void>;
  random?: () => number;
}

export class Retry {
  // Worth trying again: no answer at all or a 5xx (S3's 500 InternalError, 503 SlowDown). Never a
  // 4xx: a bad signature or a refused body fails the same way every time.
  static isTransient(error: unknown): boolean {
    if (error instanceof S3PartError) {
      return error.status === 0 || error.status >= 500;
    }

    if (isAxiosError(error)) {
      const status = error.response?.status;

      return (
        error.code !== 'ERR_CANCELED' && (status === undefined || status >= 500)
      );
    }

    return false;
  }

  // Full jitter: parts that failed together (the network dropped for all four) come back apart.
  static backoffMs(
    retry: number,
    baseMs: number,
    capMs: number,
    random: () => number,
  ): number {
    return random() * Math.min(capMs, baseMs * 2 ** retry);
  }

  // A wait that a cancel ends at once.
  static sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason as Error);
        return;
      }

      const stop = () => {
        clearTimeout(timer);
        reject(signal?.reason as Error);
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', stop);
        resolve();
      }, ms);

      signal?.addEventListener('abort', stop, { once: true });
    });
  }

  static async run<T>(
    task: () => Promise<T>,
    {
      attempts = 6,
      baseMs = 1000,
      capMs = 20_000,
      signal,
      wait = (ms, waitSignal) => Retry.sleep(ms, waitSignal),
      random = Math.random,
    }: RetryOptions = {},
  ): Promise<T> {
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await task();
      } catch (error) {
        if (
          signal?.aborted ||
          attempt >= attempts ||
          !Retry.isTransient(error)
        ) {
          throw error;
        }

        const delay = Retry.backoffMs(attempt - 1, baseMs, capMs, random);

        await wait(delay, signal);
      }
    }
  }
}
