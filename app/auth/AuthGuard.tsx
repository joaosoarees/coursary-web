import { Navigate, Outlet, useLocation } from 'react-router';

import { LocationState } from '~/auth/LocationState';
import { useAuth } from '~/auth/useAuth';

export function AuthGuard({
  isPrivate,
  children,
}: {
  isPrivate: boolean;
  children?: React.ReactNode;
}) {
  const { signedIn } = useAuth();
  const location = useLocation();

  if (isPrivate && !signedIn) {
    const from = location.pathname + location.search + location.hash;

    return <Navigate to="/entrar" replace state={{ from }} />;
  }

  if (!isPrivate && signedIn) {
    return <Navigate to={LocationState.from(location.state) ?? '/'} replace />;
  }

  return children ?? <Outlet />;
}
