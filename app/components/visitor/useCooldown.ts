import { useCallback, useEffect, useState } from 'react';

const TICK_MS = 250;

const secondsUntil = (endsAt: number) =>
  Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

export function useCooldown(seconds: number) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (endsAt === null) {
      return;
    }

    const timer = setInterval(() => {
      const left = secondsUntil(endsAt);
      setRemaining(left);

      if (left === 0) {
        setEndsAt(null);
      }
    }, TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, [endsAt]);

  const start = useCallback(() => {
    setEndsAt(Date.now() + seconds * 1000);
    setRemaining(seconds);
  }, [seconds]);

  return { remaining, start };
}
