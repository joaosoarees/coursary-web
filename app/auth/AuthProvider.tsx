import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { AuthService, type SignInInput } from '~/services/AuthService';
import {
  endSession,
  isSignedIn,
  startSession,
  subscribeToSession,
} from '~/session/session';

export interface AuthContextValue {
  signedIn: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signedIn = useSyncExternalStore(
    subscribeToSession,
    isSignedIn,
    isSignedIn,
  );

  const signIn = useCallback(async (input: SignInInput) => {
    const { accessToken } = await AuthService.signIn(input);
    startSession(accessToken);
  }, []);

  // A sign-out the API could not record still ends the session on this device.
  const signOut = useCallback(async () => {
    await AuthService.signOut().catch(() => undefined);
    endSession();
  }, []);

  const value = useMemo(
    () => ({ signedIn, signIn, signOut }),
    [signedIn, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
