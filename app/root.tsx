import './app.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* A development environment, kept out of search results. */}
        <meta name="robots" content="noindex" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center px-4">
          <span className="text-lg font-semibold">Coursary</span>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground">
          Coursary · ambiente de desenvolvimento
        </div>
      </footer>
    </QueryClientProvider>
  );
}

export function HydrateFallback() {
  return <p className="p-4 text-muted-foreground">Carregando…</p>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-semibold">
        {notFound ? 'Página não encontrada' : 'Algo deu errado'}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {notFound
          ? 'O endereço não corresponde a nenhuma página.'
          : 'Tente de novo em instantes.'}
      </p>
    </main>
  );
}
