import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

// A client navigation leaves focus on the link that was clicked, which the new page removed: a
// screen reader then says nothing and the next Tab starts at the top of the document.
export function useFocusOnNavigation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { pathname, search } = useLocation();
  const address = pathname + search;
  const lastAddress = useRef(address);

  useEffect(() => {
    if (lastAddress.current === address) {
      return;
    }

    lastAddress.current = address;
    ref.current?.focus({ preventScroll: true });
  }, [address]);

  return ref;
}
