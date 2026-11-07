import {
  createColumnHelper,
  FlexRender,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';

import { CourseFormat } from '~/components/course/CourseFormat';
import { CourseProgress } from '~/components/course/CourseProgress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/lib/utils';
import type { Student, StudentOrder } from '~/services/StudentService';

// The API sorts; without a sorted row model the table keeps the rows as they came.
const features = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof features, Student>();

const studentColumns = (lessonCount: number) =>
  columnHelper.columns([
    columnHelper.accessor('studentName', {
      header: 'Aluno',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-bold [overflow-wrap:anywhere] whitespace-normal">
            {row.original.studentName}
          </span>
          <span className="text-sm text-muted-foreground sm:hidden">
            Matriculado em {CourseFormat.date(row.original.enrolledAt)}
          </span>
        </span>
      ),
    }),
    columnHelper.accessor('enrolledAt', {
      header: ({ column }) => {
        const sorted = column.getIsSorted();

        return (
          <button
            type="button"
            onClick={() => {
              column.toggleSorting(sorted !== 'desc');
            }}
            className="-ml-2.5 inline-flex min-h-10 items-center gap-1.5 rounded-md px-2.5 font-bold text-foreground uppercase hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Matriculado em
            {sorted === 'asc' ? (
              <ArrowUp aria-hidden="true" className="size-4" />
            ) : (
              <ArrowDown aria-hidden="true" className="size-4" />
            )}
            <span className="sr-only">
              {sorted === 'asc'
                ? ', mais antigos primeiro'
                : ', mais recentes primeiro'}
            </span>
          </button>
        );
      },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {CourseFormat.date(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('completedLessons', {
      header: 'Progresso',
      enableSorting: false,
      // A lesson deleted after it was completed can leave more completed than the course has.
      cell: ({ getValue }) => (
        <CourseProgress
          completed={Math.min(getValue(), lessonCount)}
          total={lessonCount}
        />
      ),
    }),
  ]);

const ONLY_ON_WIDE_SCREENS = new Set(['enrolledAt']);

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

export function StudentsTable({
  students,
  lessonCount,
  order,
  onSort,
  busy,
}: {
  students: Student[];
  lessonCount: number;
  order: StudentOrder;
  onSort: (order: StudentOrder) => void;
  busy: boolean;
}) {
  const sorting: SortingState = [{ id: 'enrolledAt', desc: order === 'desc' }];
  const columns = useMemo(() => studentColumns(lessonCount), [lessonCount]);
  const table = useTable({
    features,
    columns,
    data: students,
    getRowId: (student) => student.accountId,
    state: { sorting },
    onSortingChange: (updater) => {
      const [next] = typeof updater === 'function' ? updater(sorting) : updater;

      onSort(next?.desc === false ? 'asc' : 'desc');
    },
    manualSorting: true,
  });

  return (
    <Table
      aria-busy={busy}
      className={cn('text-base transition-opacity', busy && 'opacity-60')}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();

              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
                  className={cn(
                    'h-12 px-5 text-sm tracking-wide',
                    ONLY_ON_WIDE_SCREENS.has(header.column.id) &&
                      'hidden sm:table-cell',
                  )}
                >
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  'px-5 py-3',
                  ONLY_ON_WIDE_SCREENS.has(cell.column.id) &&
                    'hidden sm:table-cell',
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
