import { describe, expect, it, vi } from 'vitest';

import {
  type MultipartSteps,
  MultipartUpload,
  UploadStoppedError,
} from '~/services/multipart/MultipartUpload';
import { MissingETagError, S3PartError } from '~/services/multipart/S3Part';

const PART = 4;

// Ten bytes in parts of four: 4 + 4 + 2.
const file = new File(['0123456789'], 'aula.mp4', { type: 'video/mp4' });

const noWait = () => Promise.resolve();

const stepsWith = (
  putPart: NonNullable<MultipartSteps['putPart']>,
  overrides: Partial<Omit<MultipartSteps, 'putPart'>> = {},
) => {
  const steps = {
    start: vi.fn(() =>
      Promise.resolve({ fileId: 'f1', partSize: PART, partCount: 3 }),
    ),
    partUrls: vi.fn((_fileId: string, numbers: number[]) =>
      Promise.resolve(
        numbers.map((partNumber) => ({
          partNumber,
          url: `https://bucket.example/${String(partNumber)}`,
        })),
      ),
    ),
    complete: vi.fn(() => Promise.resolve()),
    abort: vi.fn(() => Promise.resolve()),
    retry: { wait: noWait },
    ...overrides,
  };

  return { ...steps, putPart: vi.fn(putPart) };
};

const partOf = (url: string) => Number(url.split('/').at(-1));

const echo: NonNullable<MultipartSteps['putPart']> = (url, part, options) => {
  options.onProgress(part.size);

  return Promise.resolve(`"e${String(partOf(url))}"`);
};

const send = (steps: MultipartSteps, signal = new AbortController().signal) =>
  MultipartUpload.send(file, steps, vi.fn(), signal);

describe('MultipartUpload.send', () => {
  it('should slice the file at the server part size and complete with each ETag', async () => {
    const steps = stepsWith(echo);
    const onProgress = vi.fn();

    await expect(
      MultipartUpload.send(
        file,
        steps,
        onProgress,
        new AbortController().signal,
      ),
    ).resolves.toBe('f1');

    const sizes = steps.putPart.mock.calls.map(([url, part]) => [
      partOf(url),
      part.size,
    ]);
    expect(sizes).toEqual([
      [1, 4],
      [2, 4],
      [3, 2],
    ]);
    expect(steps.partUrls).toHaveBeenCalledTimes(1);
    expect(steps.complete).toHaveBeenCalledWith('f1', [
      { partNumber: 1, eTag: '"e1"' },
      { partNumber: 2, eTag: '"e2"' },
      { partNumber: 3, eTag: '"e3"' },
    ]);
    expect(onProgress).toHaveBeenLastCalledWith(10);
    expect(steps.abort).not.toHaveBeenCalled();
  });

  it('should send a part again after a dropped connection', async () => {
    const putPart = vi.fn(echo).mockRejectedValueOnce(new S3PartError(0, ''));
    const steps = stepsWith(putPart);

    await expect(send(steps)).resolves.toBe('f1');
    expect(steps.complete).toHaveBeenCalled();
  });

  it('should ask a new URL once when S3 says it expired', async () => {
    const putPart = vi
      .fn(echo)
      .mockRejectedValueOnce(new S3PartError(403, 'Request has expired'));
    const steps = stepsWith(putPart);

    await expect(send(steps)).resolves.toBe('f1');
    expect(steps.partUrls).toHaveBeenCalledTimes(2);
  });

  it('should stop every part and abort when S3 refuses one', async () => {
    const steps = stepsWith((url, part, options) =>
      partOf(url) === 2
        ? Promise.reject(new S3PartError(403, 'SignatureDoesNotMatch'))
        : echo(url, part, options),
    );

    await expect(send(steps)).rejects.toMatchObject({ status: 403 });
    expect(steps.abort).toHaveBeenCalledWith('f1');
    expect(steps.complete).not.toHaveBeenCalled();
  });

  it('should abort when the page cannot read an ETag', async () => {
    const steps = stepsWith(() => Promise.reject(new MissingETagError()));

    await expect(send(steps)).rejects.toBeInstanceOf(MissingETagError);
    expect(steps.abort).toHaveBeenCalledWith('f1');
  });

  it('should say which part the network gave out on, and abort', async () => {
    const steps = stepsWith((url, part, options) =>
      partOf(url) === 3
        ? Promise.reject(new S3PartError(0, ''))
        : echo(url, part, options),
    );

    const failure = send(steps);

    await expect(failure).rejects.toBeInstanceOf(UploadStoppedError);
    await expect(failure).rejects.toMatchObject({
      partNumber: 3,
      partCount: 3,
    });
    expect(
      steps.putPart.mock.calls.filter(([url]) => partOf(url) === 3),
    ).toHaveLength(6);
    expect(steps.abort).toHaveBeenCalledWith('f1');
  });

  it('should abort and rethrow the cancel when the page cancels', async () => {
    const cancel = new AbortController();
    const reason = new DOMException('Cancelled.', 'AbortError');
    const steps = stepsWith(
      (_url, _part, options) =>
        new Promise((_resolve, reject) => {
          if (options.signal.aborted) {
            reject(options.signal.reason as Error);
            return;
          }

          options.signal.addEventListener('abort', () => {
            reject(options.signal.reason as Error);
          });
          cancel.abort(reason);
        }),
    );

    await expect(send(steps, cancel.signal)).rejects.toBe(reason);
    expect(steps.abort).toHaveBeenCalledWith('f1');
  });

  it('should leave a completion whose answer was lost to the wait for the file', async () => {
    const lost = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
    });
    const refused = Object.assign(new Error('Not found'), {
      isAxiosError: true,
      response: { status: 404 },
    });
    const complete = vi
      .fn(() => Promise.resolve())
      .mockRejectedValueOnce(lost)
      .mockRejectedValueOnce(refused);
    const steps = stepsWith(echo, { complete });

    await expect(send(steps)).resolves.toBe('f1');
    expect(steps.abort).not.toHaveBeenCalled();
  });

  it('should abort when the API refuses the parts', async () => {
    const refused = Object.assign(new Error('Bad request'), {
      isAxiosError: true,
      response: { status: 400 },
    });
    const steps = stepsWith(echo, {
      complete: vi.fn(() => Promise.reject(refused)),
    });

    await expect(send(steps)).rejects.toBe(refused);
    expect(steps.abort).toHaveBeenCalledWith('f1');
  });
});
