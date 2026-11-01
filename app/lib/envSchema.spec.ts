import { describe, expect, it } from 'vitest';

import { envSchema } from '~/lib/envSchema';

describe('envSchema', () => {
  it('should accept an http or https address', () => {
    expect(
      envSchema.safeParse({ VITE_API_URL: 'https://api.example.com' }).success,
    ).toBe(true);
    expect(
      envSchema.safeParse({ VITE_API_URL: 'http://localhost:3000' }).success,
    ).toBe(true);
  });

  it.each([undefined, '', 'api.example.com', 'javascript:alert(1)'])(
    'should refuse %j as the API address',
    (value) => {
      expect(envSchema.safeParse({ VITE_API_URL: value }).success).toBe(false);
    },
  );
});
