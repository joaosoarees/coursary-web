import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

// A client navigation leaves focus on the link that was clicked, which the new page removed: a
// screen reader then says nothing and the next Tab starts at the top of the document.
export function useFocusOnNavigation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { pathname } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) {
      return;
    }

    lastPathname.current = pathname;
    ref.current?.focus({ preventScroll: true });
  }, [pathname]);

  return ref;
}
