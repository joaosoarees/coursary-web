import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MissingETagError,
  S3Part,
  S3PartError,
} from '~/services/multipart/S3Part';

class FakeXhr {
  static last: FakeXhr | undefined;

  method = '';
  url = '';
  status = 0;
  responseText = '';
  sent: unknown;
  aborted = false;
  headers: Record<string, string> = {};
  upload: { onprogress?: (event: { loaded: number }) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;
  onloadend?: () => void;

  constructor() {
    FakeXhr.last = this;
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  send(body: unknown) {
    this.sent = body;
  }

  abort() {
    this.aborted = true;
    this.onabort?.();
    this.onloadend?.();
  }

  getResponseHeader(name: string) {
    return this.headers[name] ?? null;
  }

  answer(status: number, headers: Record<string, string> = {}, body = '') {
    this.status = status;
    this.headers = headers;
    this.responseText = body;
    this.onload?.();
    this.onloadend?.();
  }
}

const current = () => {
  if (!FakeXhr.last) {
    throw new Error('No request was sent.');
  }

  return FakeXhr.last;
};

beforeEach(() => {
  FakeXhr.last = undefined;
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const part = new Blob(['abc']);

describe('S3Part.put', () => {
  it('should PUT the part, report progress and resolve with the ETag as sent', async () => {
    const onProgress = vi.fn();
    const sent = S3Part.put('https://bucket.example/p1', part, {
      signal: new AbortController().signal,
      onProgress,
    });

    current().upload.onprogress?.({ loaded: 2 });
    current().answer(200, { ETag: '"abc"' });

    await expect(sent).resolves.toBe('"abc"');
    expect(current()).toMatchObject({
      method: 'PUT',
      url: 'https://bucket.example/p1',
      sent: part,
    });
    expect(onProgress).toHaveBeenCalledWith(2);
  });

  it('should refuse a stored part whose ETag the page cannot read', async () => {
    const sent = S3Part.put('https://bucket.example/p1', part, {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });

    current().answer(200);

    await expect(sent).rejects.toBeInstanceOf(MissingETagError);
  });

  it('should tell an expired URL from another refusal', async () => {
    const expired = S3Part.put('https://bucket.example/p1', part, {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });
    current().answer(403, {}, '<Message>Request has expired</Message>');
    const refused = S3Part.put('https://bucket.example/p1', part, {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });
    current().answer(403, {}, '<Code>SignatureDoesNotMatch</Code>');

    await expect(expired).rejects.toMatchObject({ status: 403, expired: true });
    await expect(refused).rejects.toMatchObject({
      status: 403,
      expired: false,
    });
  });

  it('should fail with status 0 when S3 does not answer', async () => {
    const sent = S3Part.put('https://bucket.example/p1', part, {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });

    current().onerror?.();

    await expect(sent).rejects.toEqual(new S3PartError(0, ''));
  });

  it('should count a request the browser aborted as no answer', async () => {
    const sent = S3Part.put('https://bucket.example/p1', part, {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });

    current().abort();

    await expect(sent).rejects.toEqual(new S3PartError(0, ''));
  });

  it('should stop the request when the signal aborts', async () => {
    const stop = new AbortController();
    const sent = S3Part.put('https://bucket.example/p1', part, {
      signal: stop.signal,
      onProgress: vi.fn(),
    });
    const reason = new DOMException('Cancelled.', 'AbortError');

    stop.abort(reason);

    await expect(sent).rejects.toBe(reason);
    expect(current().aborted).toBe(true);
  });
});
