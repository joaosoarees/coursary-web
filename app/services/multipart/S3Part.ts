// S3's answer to one part PUT; status 0 is no answer at all (offline, a dropped connection).
export class S3PartError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(
      status === 0
        ? 'S3 could not be reached.'
        : `S3 refused a part: ${String(status)}`,
    );
  }

  // A presigned URL past its expiry: a new URL passes, the same request never does.
  get expired(): boolean {
    return this.status === 403 && this.body.includes('Request has expired');
  }
}

export class MissingETagError extends Error {
  constructor() {
    super(
      "S3 stored a part, but the page cannot read its ETag: the bucket's CORS rule must expose ETag.",
    );
  }
}

export interface PartOptions {
  signal: AbortSignal;
  onProgress: (loaded: number) => void;
}

export class S3Part {
  // XHR, not fetch: fetch has no upload progress. No headers: the URL signs the part's length,
  // which the browser takes from the Blob. The ETag goes on as S3 sent it, quotes included.
  static put(url: string, part: Blob, options: PartOptions): Promise<string> {
    const { signal, onProgress } = options;

    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(signal.reason as Error);
        return;
      }

      const xhr = new XMLHttpRequest();
      const stop = () => {
        xhr.abort();
      };

      xhr.open('PUT', url);
      xhr.upload.onprogress = (event) => {
        onProgress(event.loaded);
      };
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new S3PartError(xhr.status, xhr.responseText));
          return;
        }

        // null when the bucket's CORS rule does not expose it, although the part was stored.
        const eTag = xhr.getResponseHeader('ETag');

        if (eTag) {
          resolve(eTag);
        } else {
          reject(new MissingETagError());
        }
      };
      xhr.onerror = () => {
        reject(new S3PartError(0, ''));
      };
      // Aborted by the browser rather than the page: no answer, like a dropped connection.
      xhr.onabort = () => {
        reject(
          signal.aborted ? (signal.reason as Error) : new S3PartError(0, ''),
        );
      };
      // One listener per request, removed when it ends: a file can have a hundred parts.
      xhr.onloadend = () => {
        signal.removeEventListener('abort', stop);
      };
      signal.addEventListener('abort', stop, { once: true });

      xhr.send(part);
    });
  }
}
