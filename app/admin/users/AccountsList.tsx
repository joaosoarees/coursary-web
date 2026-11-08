import { ChevronLeft, Users } from 'lucide-react';

import {
  ROLE_TAB_LABEL,
  STATUS_FILTER_LABEL,
  STATUS_LABEL,
} from '~/admin/users/AccountLabels';
import { AccountsTable } from '~/admin/users/AccountsTable';
import { CourseFormat } from '~/components/course/CourseFormat';
import { CursorPager } from '~/components/CursorPager';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { useCursorPages } from '~/lib/useCursorPages';
import { ACCOUNTS_PAGE_SIZE, useAccounts } from '~/queries/admin';
import {
  ACCOUNT_ROLES,
  ACCOUNT_STATUSES,
  type AccountsFilter,
} from '~/services/AdminService';

type AccountPages = ReturnType<typeof useCursorPages<AccountsFilter>>;

const ALL = 'ALL';

const isRole = (value: string) => ACCOUNT_ROLES.find((role) => role === value);
const isStatus = (value: string) =>
  ACCOUNT_STATUSES.find((status) => status === value);

export function AccountsList({ pages }: { pages: AccountPages }) {
  const { filter } = pages;

  return (
    <Tabs
      value={filter.role}
      onValueChange={(value) => {
        const role = isRole(value);

        if (role) {
          pages.filterBy({ ...filter, role });
        }
      }}
      className="gap-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b">
        <TabsList aria-label="Papel" className="h-11 p-0">
          {ACCOUNT_ROLES.map((role) => (
            <TabsTrigger key={role} value={role} className="px-3.5 text-base">
              {ROLE_TAB_LABEL[role]}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center gap-2.5 pb-2">
          <Label htmlFor="filtro-status">Status</Label>
          <Select
            value={filter.status ?? ALL}
            onValueChange={(value) => {
              pages.filterBy({ ...filter, status: isStatus(value) });
            }}
          >
            <SelectTrigger id="filtro-status" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas</SelectItem>
              {ACCOUNT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_FILTER_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Radix mounts only the open tab's panel. */}
      {ACCOUNT_ROLES.map((role) => (
        <TabsContent key={role} value={role}>
          <AccountsPage pages={pages} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function AccountsPage({ pages }: { pages: AccountPages }) {
  const { filter } = pages;
  const accounts = useAccounts(filter, pages.cursor);
  const nextCursor = accounts.data?.nextCursor;
  const empty = accounts.data?.items.length === 0 && pages.index === 0;

  if (accounts.isLoading) {
    return (
      <>
        <LoadingNote>Carregando as contas…</LoadingNote>
        <Skeleton aria-hidden="true" className="h-96" />
      </>
    );
  }

  if (accounts.isError && !accounts.data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <ErrorState variant="block" onRetry={() => void accounts.refetch()} />
        {pages.index > 0 && (
          <Button variant="outline" onClick={pages.previous}>
            <ChevronLeft aria-hidden="true" />
            Voltar à página anterior
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhuma conta aqui"
        description={
          filter.status
            ? `Nenhuma conta ${STATUS_LABEL[filter.status].toLowerCase()} entre os ${ROLE_TAB_LABEL[filter.role].toLowerCase()}.`
            : `Ainda não há ${ROLE_TAB_LABEL[filter.role].toLowerCase()} na plataforma.`
        }
        action={
          filter.status && (
            <Button
              variant="outline"
              onClick={() => {
                pages.filterBy({ ...filter, status: undefined });
              }}
            >
              Mostrar todas
            </Button>
          )
        }
      />
    );
  }

  if (!accounts.data) {
    return null;
  }

  const shown = accounts.data.items.length;
  const first = pages.index * ACCOUNTS_PAGE_SIZE + 1;
  const busy = accounts.isPlaceholderData;
  const canNext = !busy && Boolean(nextCursor);

  return (
    <section
      aria-label="Lista de contas"
      aria-busy={busy}
      className="animate-content-in overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <AccountsTable
        accounts={accounts.data.items}
        showRole={false}
        busy={busy}
      />
      {pages.index === 0 && !canNext && !busy ? (
        <p className="border-t px-4 py-3.5 text-muted-foreground sm:px-5">
          {CourseFormat.count(shown, 'conta', 'contas')}
        </p>
      ) : (
        <CursorPager
          label="Páginas de contas"
          index={pages.index}
          range={
            shown === 0
              ? 'Nenhuma conta nesta página'
              : `Mostrando ${String(first)}–${String(first + shown - 1)}, mais recentes primeiro`
          }
          pageLabel={`Página ${String(pages.index + 1)}`}
          canNext={canNext}
          busy={busy}
          busyText="Carregando as contas…"
          onPrevious={pages.previous}
          onNext={() => {
            if (nextCursor) {
              pages.next(nextCursor);
            }
          }}
        />
      )}
    </section>
  );
}
