import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { createRoutesStub, useLocation } from 'react-router';

import { AuthProvider } from '~/auth/AuthProvider';
import { LocationState } from '~/auth/LocationState';

type Routes = Parameters<typeof createRoutesStub>[0];

export function renderRoutes(
  routes: Routes,
  initialEntry: string | { pathname: string; state?: unknown },
) {
  const Stub = createRoutesStub(routes);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <Stub initialEntries={[initialEntry]} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

export function Landing({ title }: { title: string }) {
  const location = useLocation();

  return (
    <>
      <h1>{title}</h1>
      <p>e-mail: {LocationState.email(location.state) ?? 'nenhum'}</p>
    </>
  );
}

export const apiError = (status: number, code: string) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: { code, message: 'English message.' } },
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
