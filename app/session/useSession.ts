import { useContext } from 'react';

import { SessionContext } from '~/session/SessionProvider';

export function useSession() {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('Cannot use `useSession` outside `SessionProvider`.');
  }

  return value;
}
