import { createContext, useMemo, useSyncExternalStore } from 'react';

import { isSignedIn, subscribeToSession } from '~/session/session';

export interface AuthContextValue {
  signedIn: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signedIn = useSyncExternalStore(
    subscribeToSession,
    isSignedIn,
    isSignedIn,
  );

  const value = useMemo(() => ({ signedIn }), [signedIn]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
