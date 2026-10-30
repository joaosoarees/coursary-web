import { TriangleAlert } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

// The fallback of every error boundary: `page` replaces a route's content, `block` one part of a
// page that broke on its own. The cause goes to the console, never to the reader.
export function ErrorState({
  variant = 'page',
  title = 'Algo deu errado',
  message = 'Não foi possível mostrar esta parte agora. Tente de novo em instantes.',
  onRetry,
}: {
  variant?: 'page' | 'block';
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const page = variant === 'page';

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-4',
        page
          ? 'mx-auto max-w-prose items-start py-16'
          : 'rounded-lg border border-input bg-card p-5',
      )}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert
          aria-hidden="true"
          className={cn(
            'shrink-0 text-destructive',
            page ? 'mt-1.5 size-6' : 'mt-0.5 size-5',
          )}
        />
        <div className="flex flex-col gap-1">
          {page ? (
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {title}
            </h1>
          ) : (
            <p className="font-bold">{title}</p>
          )}
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {onRetry && (
          <Button size={page ? 'default' : 'sm'} onClick={onRetry}>
            Tentar de novo
          </Button>
        )}
        {page && (
          <Button variant="outline" asChild>
            <a href="/">Ir para o início</a>
          </Button>
        )}
      </div>
    </div>
  );
}
