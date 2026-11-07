import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router';

// A page that answers from the cache is back before this: the bar would only flash.
const SHOW_AFTER_MS = 150;

export function NavigationProgress() {
  const busy = useNavigation().state !== 'idle';
  const [late, setLate] = useState(false);

  useEffect(() => {
    if (!busy) {
      return;
    }

    const timer = setTimeout(() => {
      setLate(true);
    }, SHOW_AFTER_MS);

    return () => {
      clearTimeout(timer);
      setLate(false);
    };
  }, [busy]);

  if (!busy || !late) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Carregando a página"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.75 overflow-hidden"
    >
      <div className="h-full w-1/3 animate-navigation-progress bg-primary motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  );
}
