import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { AuthGuard } from '~/auth/AuthGuard';
import { ErrorState } from '~/components/ErrorState';
import { VisitorShell } from '~/components/visitor/VisitorShell';

import type { Route } from './+types/visitor-layout';

export default function VisitorLayout() {
  return (
    <AuthGuard isPrivate={false}>
      <VisitorShell>
        <Outlet />
      </VisitorShell>
    </AuthGuard>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <VisitorShell>
      <ErrorState
        onRetry={() => {
          void navigate(location, { replace: true });
        }}
      />
    </VisitorShell>
  );
}
