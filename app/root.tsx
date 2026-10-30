import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource-variable/bricolage-grotesque/wght.css';
import './app.css';

import bodyFont from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
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

import { ThemeProvider } from '~/theme/ThemeProvider';
import { themeScript } from '~/theme/themeScript';
import { ThemeSwitcher } from '~/theme/ThemeSwitcher';

import type { Route } from './+types/root';

// The body face is on every page: fetched with the HTML instead of after the stylesheet.
export const links: Route.LinksFunction = () => [
  {
    rel: 'preload',
    href: bodyFont,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
      <ThemeProvider>
        <header className="bg-shell text-shell-foreground">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <span className="font-display text-lg font-bold">Coursary</span>
            <ThemeSwitcher className="flex gap-1" />
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
      </ThemeProvider>
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
