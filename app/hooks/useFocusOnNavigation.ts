import { useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router';

// A client navigation leaves focus on the link that was clicked, which the new page removed: a
// screen reader then says nothing and the next Tab starts at the top of the document.
export function useFocusOnNavigation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { pathname, search } = useLocation();
  const address = pathname + search;
  const lastAddress = useRef(address);
  const type = useNavigationType();
  const cameIn = useRef(type !== NavigationType.Pop);

  // A link into another shell (the editor's "Ver como aluno", a course's lesson) mounts this one
  // fresh, so the address never changes under it; the first load of the page is a POP.
  useEffect(() => {
    if (cameIn.current) {
      ref.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (lastAddress.current === address) {
      return;
    }

    lastAddress.current = address;
    ref.current?.focus({ preventScroll: true });
  }, [address]);

  return ref;
}
