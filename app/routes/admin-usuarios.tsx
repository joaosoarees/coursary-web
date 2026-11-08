import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { AccountSearch } from '~/admin/users/AccountSearch';
import { AccountSearchResult } from '~/admin/users/AccountSearchResult';
import { AccountsFilterParams } from '~/admin/users/AccountsFilterParams';
import { AccountsList } from '~/admin/users/AccountsList';
import { useCursorStack } from '~/lib/useCursorStack';

import type { Route } from './+types/admin-usuarios';

export const meta: Route.MetaFunction = () => [
  { title: 'Usuários · Coursary' },
];

export default function AdminUsersPage() {
  // The tab and the status live in the address; the cursors cannot, so the page stays here, which
  // also brings the list back on the same page after a search.
  const [params, setParams] = useSearchParams();
  const filter = AccountsFilterParams.read(params);
  const stack = useCursorStack(`${filter.role}:${filter.status ?? ''}`);
  const pages = {
    ...stack,
    filter,
    filterBy: (next: typeof filter) => {
      setParams(AccountsFilterParams.write(next), {
        replace: true,
        preventScrollReset: true,
      });
    },
  };
  const [searched, setSearched] = useState<string>();
  // A new key empties the search field; after the first clearing it also takes the focus back.
  const [clearings, setClearings] = useState(0);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-[1_1_22rem] flex-col gap-1">
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Papéis e acesso das contas da plataforma.
          </p>
        </div>
        <AccountSearch
          key={clearings}
          takeFocus={clearings > 0}
          onSearch={setSearched}
        />
      </header>
      {searched === undefined ? (
        <AccountsList pages={pages} />
      ) : (
        <AccountSearchResult
          email={searched}
          onClear={() => {
            setSearched(undefined);
            setClearings((count) => count + 1);
          }}
        />
      )}
    </section>
  );
}
