import { useId } from 'react';

import { ROLE_LABEL } from '~/admin/users/AccountLabels';
import { CourseFormat } from '~/components/course/CourseFormat';
import { ErrorState } from '~/components/ErrorState';
import { LoadMore } from '~/components/LoadMore';
import { Skeleton } from '~/components/ui/skeleton';
import { useRoleChanges } from '~/queries/admin';

// The API keeps who changed it as an account id, or "bootstrap" for the first admin's script.
const byWhom = (changedBy: string, myId: string | undefined) =>
  changedBy === 'bootstrap'
    ? 'pelo script inicial'
    : myId === undefined
      ? 'por um admin'
      : changedBy === myId
        ? 'por você'
        : 'por outro admin';

export function RoleHistory({
  accountId,
  myId,
}: {
  accountId: string;
  myId: string | undefined;
}) {
  const id = useId();
  const history = useRoleChanges(accountId);
  const changes = history.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 pt-6">
      <h3 id={id} className="font-display text-lg font-bold">
        Histórico de papéis
      </h3>
      {history.isPending ? (
        <Skeleton aria-hidden="true" className="h-16" />
      ) : history.isError ? (
        <ErrorState variant="block" onRetry={() => void history.refetch()} />
      ) : changes.length === 0 ? (
        <p className="text-muted-foreground">
          O papel desta conta nunca mudou desde o cadastro.
        </p>
      ) : (
        <>
          <ol className="flex flex-col">
            {changes.map((change) => (
              <li key={change.id} className="flex gap-3.5 py-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2 shrink-0 rounded-full bg-foreground"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-bold">
                    {ROLE_LABEL[change.fromRole]} → {ROLE_LABEL[change.toRole]}
                  </span>
                  <span className="text-muted-foreground">
                    {CourseFormat.date(change.changedAt)} ·{' '}
                    {byWhom(change.changedBy, myId)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <LoadMore
            list={history}
            auto={false}
            labels={{
              more: 'Mostrar mais mudanças',
              loading: 'Carregando mais mudanças…',
              failed: 'Não deu para carregar mais mudanças.',
            }}
          />
        </>
      )}
      <p className="text-sm text-muted-foreground">
        Desativações e reativações não entram no histórico.
      </p>
    </section>
  );
}
