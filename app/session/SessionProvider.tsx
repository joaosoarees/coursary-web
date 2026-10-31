import { createContext, useMemo, useSyncExternalStore } from 'react';

import {
  getSessionStatus,
  type SessionStatus,
  subscribeToSession,
} from '~/session/session';

export interface SessionContextValue {
  status: SessionStatus;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const status = useSyncExternalStore(
    subscribeToSession,
    getSessionStatus,
    getSessionStatus,
  );

  const value = useMemo(() => ({ status }), [status]);

  return <SessionContext value={value}>{children}</SessionContext>;
}
