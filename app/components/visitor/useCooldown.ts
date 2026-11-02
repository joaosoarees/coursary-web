import { useCallback, useEffect, useState } from 'react';

const TICK_MS = 250;

export function useCooldown(seconds: number) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) {
      return;
    }

    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);

      if (current >= endsAt) {
        setEndsAt(null);
      }
    }, TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, [endsAt]);

  const start = useCallback(() => {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
  }, [seconds]);

  const remaining =
    endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return { remaining, start };
}
