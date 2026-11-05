import { Navigate, Outlet } from 'react-router';

import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { useMe } from '~/queries/me';
import type { Profile } from '~/services/AccountService';

export const canTeach = (role: Profile['role']) => role !== 'student';

// Hides the teaching pages from students; the API refuses their requests either way.
export function TeachingGuard() {
  const me = useMe();

  if (me.isPending) {
    return <LoadingNote>Carregando…</LoadingNote>;
  }

  if (me.isError) {
    return <ErrorState variant="block" onRetry={() => void me.refetch()} />;
  }

  if (!canTeach(me.data.role)) {
    return <Navigate to="/cursos" replace />;
  }

  return <Outlet />;
}
