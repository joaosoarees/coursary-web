import axios, { type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { S3Upload } from '~/services/S3Upload';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = axios.defaults.adapter;

beforeEach(() => {
  axios.defaults.adapter = adapter;
});

afterEach(() => {
  axios.defaults.adapter = defaultAdapter;
});

const post = {
  url: 'https://bucket.s3.amazonaws.com/',
  fields: { key: 'account/a/avatar/f/original', 'Content-Type': 'image/png' },
};
const file = new File(['png'], 'foto.png', { type: 'image/png' });

describe('S3Upload', () => {
  it('should send every signed field in order and the file last', () => {
    const form = S3Upload.form(post, file);

    expect([...form.keys()]).toEqual(['key', 'Content-Type', 'file']);
    expect(form.get('file')).toBe(file);
  });

  it('should post to the bucket with no credentials and report progress', async () => {
    const onProgress = vi.fn();
    adapter.mockImplementationOnce((config) => {
      config.onUploadProgress?.({
        loaded: 3,
        total: 4,
        bytes: 3,
        lengthComputable: true,
      });

      return Promise.resolve({
        data: '',
        status: 204,
        statusText: '',
        headers: {},
        config,
      });
    });

    await S3Upload.post(post, file, onProgress);

    const [config] = adapter.mock.calls[0] ?? [];
    expect(config).toMatchObject({ method: 'post', url: post.url });
    expect(config?.withCredentials).toBeFalsy();
    expect(config?.headers.Authorization).toBeUndefined();
    expect(onProgress).toHaveBeenCalledWith(0.75);
  });
});
