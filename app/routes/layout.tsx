import { useEffect } from 'react';
import {
  isRouteErrorResponse,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router';

import { AppShell } from '~/components/AppShell';
import { ErrorState } from '~/components/ErrorState';

import type { Route } from './+types/layout';

export default function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

// A page that fails keeps the navigation around it, so the reader can leave without reloading.
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!notFound) {
      console.error(error);
    }
  }, [error, notFound]);

  return (
    <AppShell>
      {notFound ? (
        <ErrorState
          title="Página não encontrada"
          message="O endereço não corresponde a nenhuma página."
        />
      ) : (
        <ErrorState
          onRetry={() => {
            // Navigating to the same address clears the error and runs the route again.
            void navigate(location, { replace: true });
          }}
        />
      )}
    </AppShell>
  );
}
