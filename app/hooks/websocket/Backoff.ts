export class Backoff {
  // Full jitter: a random wait up to base * 2^attempt, capped. Clients dropped together
  // (a deploy, the two-hour cut) spread out instead of all coming back in the same second.
  static delay(
    attempt: number,
    { baseDelayMs, maxDelayMs }: { baseDelayMs: number; maxDelayMs: number },
    random: () => number = Math.random,
  ): number {
    const ceiling = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);

    return Math.round(random() * ceiling);
  }
}
