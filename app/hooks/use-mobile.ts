import { useSyncExternalStore } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

function subscribe(onStoreChange: () => void) {
  const mediaQueryList = window.matchMedia(MOBILE_QUERY);
  mediaQueryList.addEventListener('change', onStoreChange);

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange);
  };
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

const getServerSnapshot = () => false;

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
