import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router';

import { ErrorState } from '~/components/ErrorState';

type Fallback =
  { title: string; fallback?: never } | { fallback: ReactNode; title?: never };

export function BlockBoundary({
  title,
  fallback,
  resetKeys = [],
  children,
}: Fallback & { resetKeys?: unknown[]; children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    // A block in a layout outlives the page below it: without the path, its fallback would stay after leaving.
    <ErrorBoundary
      resetKeys={[pathname, ...resetKeys]}
      fallbackRender={({ resetErrorBoundary }: FallbackProps) =>
        fallback === undefined ? (
          <ErrorState
            variant="block"
            title={title}
            onRetry={() => {
              resetErrorBoundary();
            }}
          />
        ) : (
          fallback
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
