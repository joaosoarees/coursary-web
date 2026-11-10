import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router';

import { ErrorState } from '~/components/ErrorState';

// A custom fallback is for a place too small for the error state, such as the account menu.
type Fallback =
  { title: string; fallback?: never } | { fallback: ReactNode; title?: never };

export function BlockBoundary({
  title,
  fallback,
  children,
}: Fallback & { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    // A block in a layout outlives the page below it: without the path, its fallback would stay after leaving.
    <ErrorBoundary
      resetKeys={[pathname]}
      fallbackRender={({ resetErrorBoundary }: FallbackProps) =>
        fallback ?? (
          <ErrorState
            variant="block"
            title={title}
            onRetry={() => {
              resetErrorBoundary();
            }}
          />
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
