import { SearchX, X } from 'lucide-react';

import { AccountsTable } from '~/admin/users/AccountsTable';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { TableSkeleton } from '~/components/TableSkeleton';
import { Button } from '~/components/ui/button';
import { useAccountByEmail } from '~/queries/admin';

export function AccountSearchResult({
  email,
  onClear,
}: {
  email: string;
  onClear: () => void;
}) {
  const result = useAccountByEmail(email);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p role="status" className="font-bold [overflow-wrap:anywhere]">
          {result.isPending
            ? `Buscando ${email}…`
            : result.isError
              ? `Busca por ${email}`
              : result.data
                ? '1 conta com esse e-mail'
                : `Busca por ${email}`}
          {!result.isPending && !result.isError && !result.data && (
            <span className="sr-only">: nenhuma conta encontrada</span>
          )}
        </p>
        <Button variant="outline" onClick={onClear}>
          <X aria-hidden="true" />
          Limpar busca
        </Button>
      </div>
      {result.isPending ? (
        <TableSkeleton rows={1} />
      ) : result.isError ? (
        <ErrorState variant="block" onRetry={() => void result.refetch()} />
      ) : result.data ? (
        <section
          aria-label="Resultado da busca"
          className="animate-content-in overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <AccountsTable accounts={[result.data]} showRole busy={false} />
        </section>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Nenhuma conta com esse e-mail"
          description="A busca procura o e-mail exato, sem diferenciar maiúsculas. Confira se ele foi digitado inteiro."
        />
      )}
    </div>
  );
}
