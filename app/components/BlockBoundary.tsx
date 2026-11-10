import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router';

import { ErrorState } from '~/components/ErrorState';

export function BlockBoundary({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    // A block in a layout outlives the page below it: without the path, its fallback would stay after leaving.
    <ErrorBoundary
      resetKeys={[pathname]}
      fallbackRender={({ resetErrorBoundary }: FallbackProps) => (
        <ErrorState
          variant="block"
          title={title}
          onRetry={() => {
            resetErrorBoundary();
          }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
