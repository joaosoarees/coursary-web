import { Navigate, Outlet } from 'react-router';

import { ErrorState } from '~/components/ErrorState';
import { useMe } from '~/queries/me';
import type { Profile } from '~/services/AccountService';

// Hides a group of pages from the roles that cannot use them; the API refuses their requests
// either way.
export function RoleGuard({
  allows,
}: {
  allows: (role: Profile['role']) => boolean;
}) {
  const me = useMe();

  // The account menu reads /me with the shell, so this wait is short and the page's own loading
  // announcement follows; a status here too would be read twice.
  if (me.isPending) {
    return null;
  }

  if (me.isError) {
    return <ErrorState variant="block" onRetry={() => void me.refetch()} />;
  }

  if (!allows(me.data.role)) {
    return <Navigate to="/cursos" replace />;
  }

  return <Outlet />;
}
