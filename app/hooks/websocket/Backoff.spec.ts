import { describe, expect, it } from 'vitest';

import { Backoff } from '~/hooks/websocket/Backoff';

const options = { baseDelayMs: 1_000, maxDelayMs: 30_000 };

describe('Backoff', () => {
  it('should double the ceiling with each attempt, up to the cap', () => {
    const top = () => 1;

    expect(Backoff.delay(0, options, top)).toBe(1_000);
    expect(Backoff.delay(2, options, top)).toBe(4_000);
    expect(Backoff.delay(10, options, top)).toBe(30_000);
  });

  it('should wait a random share of the ceiling', () => {
    expect(Backoff.delay(2, options, () => 0.25)).toBe(1_000);
    expect(Backoff.delay(2, options, () => 0)).toBe(0);
  });
});
