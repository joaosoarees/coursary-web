import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource-variable/bricolage-grotesque/wght.css';
import './app.css';

import bodyFont from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { ErrorState } from '~/components/ErrorState';
import { Toaster } from '~/components/ui/sonner';
import { queryClient } from '~/lib/queryClient';
import { ThemeProvider } from '~/theme/ThemeProvider';
import { themeScript } from '~/theme/themeScript';

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
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export function HydrateFallback() {
  return <p className="p-5 text-muted-foreground">Carregando…</p>;
}

// The last resort, without the navigation: only an error in the layout itself lands here.
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="px-5">
      <ErrorState
        onRetry={() => {
          window.location.reload();
        }}
      />
    </main>
  );
}
