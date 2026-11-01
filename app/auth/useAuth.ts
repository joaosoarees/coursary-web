import { use } from 'react';

import { AuthContext } from '~/auth/AuthProvider';

export function useAuth() {
  const value = use(AuthContext);

  if (!value) {
    throw new Error('Cannot use `useAuth` outside `AuthProvider`.');
  }

  return value;
}
