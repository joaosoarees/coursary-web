import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('env', () => {
  it('should expose the validated API address', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const { env } = await import('~/lib/env');

    expect(env.VITE_API_URL).toBe('https://api.example.com');
  });

  it('should refuse to load without a valid API address', async () => {
    vi.stubEnv('VITE_API_URL', 'api.example.com');

    await expect(import('~/lib/env')).rejects.toThrow(/VITE_API_URL/);
  });
});
