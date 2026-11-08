import { useState } from 'react';

import { AccountSearch } from '~/admin/users/AccountSearch';
import { AccountSearchResult } from '~/admin/users/AccountSearchResult';
import { AccountsList } from '~/admin/users/AccountsList';
import { useCursorPages } from '~/lib/useCursorPages';
import type { AccountsFilter } from '~/services/AdminService';

import type { Route } from './+types/admin-usuarios';

export const meta: Route.MetaFunction = () => [
  { title: 'Usuários · Coursary' },
];

export default function AdminUsersPage() {
  // Kept here, so the list comes back on the same tab and page after a search.
  const pages = useCursorPages<AccountsFilter>({
    role: 'student',
    status: undefined,
  });
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
