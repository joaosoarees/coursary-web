import type { PartUrl } from '~/services/VideoService';

// The route signs at most 100 URLs a call.
export const URLS_PER_CALL = 100;

// Asks for the URLs a window at a time, when the first part of the window needs one; parts of one
// window that need a URL together share the request.
export class PartUrls {
  private readonly pending = new Map<number, Promise<Map<number, string>>>();

  private readonly loaded = new Map<number, Map<number, string>>();

  constructor(
    private readonly fetchUrls: (partNumbers: number[]) => Promise<PartUrl[]>,
    private readonly partCount: number,
  ) {}

  async get(partNumber: number): Promise<string> {
    const index = PartUrls.windowOf(partNumber);
    const request = this.pending.get(index) ?? this.load(index);
    const urls = await request;
    const url = urls.get(partNumber);

    if (!url) {
      throw new Error(
        `The API returned no URL for part ${String(partNumber)}.`,
      );
    }

    return url;
  }

  // S3 said this URL had expired. Only once per window: the other parts that hit the same expiry
  // find the new request.
  renew(partNumber: number, expiredUrl: string): void {
    const index = PartUrls.windowOf(partNumber);

    if (this.loaded.get(index)?.get(partNumber) === expiredUrl) {
      this.pending.delete(index);
      this.loaded.delete(index);
    }
  }

  private load(index: number): Promise<Map<number, string>> {
    const first = index * URLS_PER_CALL + 1;
    const last = Math.min(first + URLS_PER_CALL - 1, this.partCount);
    const numbers = Array.from(
      { length: last - first + 1 },
      (_, offset) => first + offset,
    );
    const request = this.fetchUrls(numbers).then((urls) => {
      const byNumber = new Map(
        urls.map(({ partNumber, url }) => [partNumber, url]),
      );

      this.loaded.set(index, byNumber);

      return byNumber;
    });

    this.pending.set(index, request);
    // A failed request is forgotten, so the next get asks again.
    request.catch(() => {
      if (this.pending.get(index) === request) {
        this.pending.delete(index);
      }
    });

    return request;
  }

  private static windowOf(partNumber: number): number {
    return Math.floor((partNumber - 1) / URLS_PER_CALL);
  }
}
