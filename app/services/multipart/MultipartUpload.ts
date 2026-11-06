import { isAxiosError } from 'axios';

import { PartUrls } from '~/services/multipart/PartUrls';
import { Retry, type RetryOptions } from '~/services/multipart/Retry';
import { S3Part, S3PartError } from '~/services/multipart/S3Part';
import type { PartUrl, SentPart, StartedVideo } from '~/services/VideoService';

// About six connections per host over HTTP/1.1, the rest queued: four keep a part URL from aging in
// the queue and leave room for the API calls.
export const PART_CONCURRENCY = 4;

export interface MultipartSteps {
  start: (signal: AbortSignal) => Promise<StartedVideo>;
  partUrls: (
    fileId: string,
    partNumbers: number[],
    signal: AbortSignal,
  ) => Promise<PartUrl[]>;
  complete: (fileId: string, parts: SentPart[]) => Promise<void>;
  abort: (fileId: string) => Promise<void>;
  // Every part is in S3: from here a cancel no longer stops the upload.
  onPartsSent?: () => void;
  putPart?: typeof S3Part.put;
  retry?: Omit<RetryOptions, 'signal'>;
}

// The network gave out on a part after every retry. There is no resume: the upload was aborted.
export class UploadStoppedError extends Error {
  constructor(
    readonly partNumber: number,
    readonly partCount: number,
    cause: unknown,
  ) {
    super(
      `The upload stopped at part ${String(partNumber)} of ${String(partCount)}.`,
      { cause },
    );
  }
}

type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown };

export class MultipartUpload {
  // Resolves with the file id once the API took the parts; the caller then waits for the file.
  static async send(
    file: File,
    steps: MultipartSteps,
    onProgress: (loaded: number) => void,
    signal: AbortSignal,
  ): Promise<string> {
    const retry = steps.retry ?? {};
    const putPart =
      steps.putPart ??
      ((url: string, part: Blob, options) => S3Part.put(url, part, options));
    const started = await Retry.run(() => steps.start(signal), {
      ...retry,
      signal,
    });
    const { fileId, partSize, partCount } = started;

    // Bytes sent per part, for one bar over the file; a part sent again starts from 0.
    const sent = new Map<number, number>();
    let loaded = 0;
    const setSent = (partNumber: number, bytes: number) => {
      loaded += bytes - (sent.get(partNumber) ?? 0);
      sent.set(partNumber, bytes);
      onProgress(loaded);
    };

    // The first part that fails for good stops the others at once.
    const stop = new AbortController();
    const parts = AbortSignal.any([signal, stop.signal]);
    const urls = new PartUrls(
      (numbers) =>
        Retry.run(() => steps.partUrls(fileId, numbers, parts), {
          ...retry,
          signal: parts,
        }),
      partCount,
    );

    const sendPart = async (partNumber: number): Promise<SentPart> => {
      parts.throwIfAborted();
      const start = (partNumber - 1) * partSize;
      // No type: the PUT sends no Content-Type, which the upload fixed when it opened.
      const body = file.slice(start, Math.min(start + partSize, file.size));

      for (let renewed = false; ; renewed = true) {
        const url = await urls.get(partNumber);

        try {
          const eTag = await Retry.run(
            () =>
              putPart(url, body, {
                signal: parts,
                onProgress: (bytes) => {
                  setSent(partNumber, bytes);
                },
              }),
            { ...retry, signal: parts },
          );

          setSent(partNumber, body.size);

          return { partNumber, eTag };
        } catch (error) {
          // Expired before it started: one new URL, not the same request again.
          if (!renewed && error instanceof S3PartError && error.expired) {
            urls.renew(partNumber, url);
            continue;
          }

          throw error;
        }
      }
    };

    const numbers = Array.from({ length: partCount }, (_, index) => index + 1);
    let failed: { partNumber: number; error: unknown } | undefined;
    const results = await MultipartUpload.pool(
      numbers,
      PART_CONCURRENCY,
      async (partNumber) => {
        try {
          return await sendPart(partNumber);
        } catch (error) {
          failed ??= { partNumber, error };
          stop.abort(error);
          throw error;
        }
      },
    );

    // The pool waited for every part, so nothing is still arriving at S3 when the upload is aborted.
    const done = results.flatMap((result) => (result.ok ? [result.value] : []));

    if (done.length < partCount) {
      await MultipartUpload.abandon(steps, fileId);

      if (signal.aborted) {
        throw signal.reason;
      }

      if (failed && Retry.isTransient(failed.error)) {
        throw new UploadStoppedError(
          failed.partNumber,
          partCount,
          failed.error,
        );
      }

      throw failed?.error;
    }

    steps.onPartsSent?.();
    await MultipartUpload.complete(steps, fileId, done);

    return fileId;
  }

  // Retried on a passing failure. After a lost answer, a refusal can mean the first call did
  // complete it: the caller's wait for the file decides.
  private static async complete(
    steps: MultipartSteps,
    fileId: string,
    parts: SentPart[],
  ): Promise<void> {
    // An object, not a let: the flag is set inside the retried task.
    const answer = { lost: false };

    try {
      await Retry.run(async () => {
        try {
          await steps.complete(fileId, parts);
        } catch (error) {
          answer.lost ||= Retry.isTransient(error);
          throw error;
        }
      }, steps.retry);
    } catch (error) {
      // A 400 says the parts do not make the file, whatever the first answer was.
      const refused = isAxiosError(error) && error.response?.status === 400;

      if (answer.lost && !refused) {
        return;
      }

      await MultipartUpload.abandon(steps, fileId);
      throw error;
    }
  }

  // A failed abort is logged, not shown: the bucket's lifecycle rule removes the parts anyway.
  private static async abandon(
    steps: MultipartSteps,
    fileId: string,
  ): Promise<void> {
    try {
      await Retry.run(() => steps.abort(fileId), steps.retry);
    } catch (error) {
      console.error('Could not abort the video upload:', error);
    }
  }

  // Never rejects, and waits for every item: Promise.all would leave the other parts running.
  private static async pool<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<R>,
  ): Promise<Settled<R>[]> {
    const results: Settled<R>[] = [];
    let next = 0;

    const run = async () => {
      while (next < items.length) {
        const index = next;
        const item = items[index] as T;

        next += 1;

        try {
          results[index] = { ok: true, value: await worker(item) };
        } catch (error) {
          results[index] = { ok: false, error };
        }
      }
    };

    const runners = Array.from(
      { length: Math.min(concurrency, items.length) },
      run,
    );

    await Promise.all(runners);

    return results;
  }
}
