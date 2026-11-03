import { useEffect, useRef } from 'react';

// Screen readers announce a change inside a live region; one that mounts with its text already
// in it is often read by no one, so the text goes in after the region is on the page.
export function LoadingNote({ children }: { children: string }) {
  const region = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (region.current) {
      region.current.textContent = children;
    }
  }, [children]);

  return <p ref={region} role="status" className="sr-only" />;
}
