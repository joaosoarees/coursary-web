import { describe, expect, it } from 'vitest';

import { envSchema } from '~/lib/envSchema';

const valid = {
  VITE_API_URL: 'https://api.example.com',
  VITE_WS_URL: 'wss://ws.example.com',
};

describe('envSchema', () => {
  it('should accept an http or https address', () => {
    expect(envSchema.safeParse(valid).success).toBe(true);
    expect(
      envSchema.safeParse({ ...valid, VITE_API_URL: 'http://localhost:3000' })
        .success,
    ).toBe(true);
  });

  it.each([undefined, '', 'api.example.com', 'javascript:alert(1)'])(
    'should refuse %j as the API address',
    (value) => {
      expect(
        envSchema.safeParse({ ...valid, VITE_API_URL: value }).success,
      ).toBe(false);
    },
  );

  it.each([undefined, 'https://ws.example.com', 'ws.example.com'])(
    'should refuse %j as the websocket address',
    (value) => {
      expect(
        envSchema.safeParse({ ...valid, VITE_WS_URL: value }).success,
      ).toBe(false);
    },
  );
});
