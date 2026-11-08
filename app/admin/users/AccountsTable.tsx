import {
  createColumnHelper,
  FlexRender,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';

import { ROLE_LABEL } from '~/admin/users/AccountLabels';
import { AccountStatusBadge } from '~/admin/users/AccountStatusBadge';
import { CourseFormat } from '~/components/course/CourseFormat';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/lib/utils';
import type { AccountSummary } from '~/services/AdminService';

// The API filters and orders; the table only lays the rows out.
const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, AccountSummary>();

const accountColumns = (
  showRole: boolean,
  onOpen: (account: AccountSummary) => void,
) =>
  columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'Nome',
      cell: ({ row }) => (
        <span className="flex flex-col gap-0.5">
          <button
            type="button"
            aria-haspopup="dialog"
            className="-ml-1.5 min-h-10 self-start rounded-sm px-1.5 text-left font-bold [overflow-wrap:anywhere] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => {
              onOpen(row.original);
            }}
          >
            {row.original.name}
          </button>
          <span className="text-sm [overflow-wrap:anywhere] text-muted-foreground sm:hidden">
            {row.original.email}
          </span>
        </span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'E-mail',
      cell: ({ getValue }) => (
        <span className="[overflow-wrap:anywhere] text-muted-foreground">
          {getValue()}
        </span>
      ),
    }),
    ...(showRole
      ? [
          columnHelper.accessor('role', {
            header: 'Papel',
            cell: ({ getValue }) => ROLE_LABEL[getValue()],
          }),
        ]
      : []),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => <AccountStatusBadge status={getValue()} />,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Criada em',
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {CourseFormat.date(getValue())}
        </span>
      ),
    }),
  ]);

// On a phone the e-mail moves under the name and the date goes away.
const COLUMN_CLASS: Partial<Record<string, string>> = {
  email: 'hidden sm:table-cell',
  role: 'w-32',
  status: 'w-36',
  createdAt: 'hidden sm:table-cell sm:w-40',
};

export function AccountsTable({
  accounts,
  showRole,
  busy,
  openedId,
  onOpen,
}: {
  accounts: AccountSummary[];
  showRole: boolean;
  busy: boolean;
  openedId: string | undefined;
  onOpen: (account: AccountSummary) => void;
}) {
  const columns = useMemo(
    () => accountColumns(showRole, onOpen),
    [showRole, onOpen],
  );
  const table = useTable({
    features,
    columns,
    data: accounts,
    getRowId: (account) => account.id,
  });

  return (
    <Table
      className={cn('table-fixed transition-opacity', busy && 'opacity-75')}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className={cn(
                  'h-12 px-4 text-sm tracking-[0.04em] uppercase sm:px-5',
                  COLUMN_CLASS[header.column.id],
                )}
              >
                {header.isPlaceholder ? null : <FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.id === openedId ? 'selected' : undefined}
          >
            {row.getAllCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  'px-4 py-3 whitespace-normal sm:px-5',
                  COLUMN_CLASS[cell.column.id],
                )}
              >
                <FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
