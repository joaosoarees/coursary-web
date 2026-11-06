import { describe, expect, it, vi } from 'vitest';

import { PartUrls } from '~/services/multipart/PartUrls';
import type { PartUrl } from '~/services/VideoService';

const signer = () => {
  let round = 0;

  return vi.fn((numbers: number[]) => {
    round += 1;
    const urls: PartUrl[] = numbers.map((partNumber) => ({
      partNumber,
      url: `https://bucket.example/${String(round)}/${String(partNumber)}`,
    }));

    return Promise.resolve(urls);
  });
};

describe('PartUrls', () => {
  it('should ask once for a window that several parts need together', async () => {
    const fetchUrls = signer();
    const urls = new PartUrls(fetchUrls, 3);

    await expect(
      Promise.all([urls.get(1), urls.get(2), urls.get(3)]),
    ).resolves.toEqual([
      'https://bucket.example/1/1',
      'https://bucket.example/1/2',
      'https://bucket.example/1/3',
    ]);
    expect(fetchUrls).toHaveBeenCalledTimes(1);
    expect(fetchUrls).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('should ask for the next window only when a part of it needs a URL', async () => {
    const fetchUrls = signer();
    const urls = new PartUrls(fetchUrls, 128);

    await urls.get(1);
    await urls.get(101);

    expect(fetchUrls).toHaveBeenCalledTimes(2);
    expect(fetchUrls.mock.calls[0]?.[0]).toHaveLength(100);
    expect(fetchUrls.mock.calls[1]?.[0]).toEqual(
      Array.from({ length: 28 }, (_, index) => 101 + index),
    );
  });

  it('should ask a window again once when its URLs expired', async () => {
    const fetchUrls = signer();
    const urls = new PartUrls(fetchUrls, 2);
    const [first, second] = await Promise.all([urls.get(1), urls.get(2)]);

    urls.renew(1, first);
    urls.renew(2, second);

    await expect(urls.get(1)).resolves.toBe('https://bucket.example/2/1');
    await expect(urls.get(2)).resolves.toBe('https://bucket.example/2/2');
    expect(fetchUrls).toHaveBeenCalledTimes(2);
  });

  it('should ask again after a failed request', async () => {
    const fetchUrls = vi
      .fn<(numbers: number[]) => Promise<PartUrl[]>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([{ partNumber: 1, url: 'https://bucket.example/1' }]);
    const urls = new PartUrls(fetchUrls, 1);

    await expect(urls.get(1)).rejects.toThrow('offline');
    await expect(urls.get(1)).resolves.toBe('https://bucket.example/1');
  });
});
