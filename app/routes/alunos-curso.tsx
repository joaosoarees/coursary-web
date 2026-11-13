import { noop } from '@tanstack/react-query';
import { ChevronLeft, Users } from 'lucide-react';
import { useEffect, useEffectEvent, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';

import { BlockBoundary } from '~/components/BlockBoundary';
import { CourseFormat } from '~/components/course/CourseFormat';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { TableSkeleton } from '~/components/TableSkeleton';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import {
  StudentsExportButton,
  StudentsExportStatus,
} from '~/instructor/students/StudentsExport';
import { StudentsPager } from '~/instructor/students/StudentsPager';
import { StudentsTable } from '~/instructor/students/StudentsTable';
import { useStudentExport } from '~/instructor/students/useStudentExport';
import { queryClient } from '~/lib/queryClient';
import { useCursorPages } from '~/lib/useCursorPages';
import { managedCourseQuery, useManagedCourse } from '~/queries/instructor';
import { courseStudentsQuery, useCourseStudents } from '~/queries/students';
import { ApiFailure } from '~/services/ApiFailure';
import type { ManagedCourse } from '~/services/InstructorService';
import type { StudentOrder } from '~/services/StudentService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/alunos-curso';

const EMPTY_DESCRIPTION: Record<ManagedCourse['status'], string> = {
  DRAFT:
    'O curso recebe matrículas depois de publicado. Os alunos aparecem aqui, com o progresso de cada um.',
  PUBLISHED: 'Os alunos aparecem aqui, com o progresso de cada um.',
  ARCHIVED: 'O curso foi arquivado sem alunos e não recebe matrículas novas.',
};

const NOT_MINE = new Set(['COURSE_NOT_FOUND', 'VALIDATION', 'FORBIDDEN']);

// The course's own title is rendered by the page once it loads: the loader does not wait for it.
export const meta: Route.MetaFunction = () => [{ title: 'Alunos · Coursary' }];

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (isSignedIn()) {
    void queryClient.query(managedCourseQuery(params.id)).catch(noop);
    void queryClient
      .query(
        courseStudentsQuery(params.id, { cursor: undefined, order: 'desc' }),
      )
      .catch(noop);
  }

  return null;
}

export default function CourseStudentsPage({ params }: Route.ComponentProps) {
  const course = useManagedCourse(params.id);

  return (
    <section className="flex flex-col gap-6">
      <Link
        to={`/instrutor/cursos/${params.id}`}
        className="inline-flex min-h-10 items-center gap-1.5 self-start font-bold text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Voltar ao curso
      </Link>
      {course.isLoading ? (
        <StudentsSkeleton />
      ) : course.isLoadingError ? (
        NOT_MINE.has(ApiFailure.codeOf(course.error) ?? '') ? (
          <ErrorState
            title="Curso não encontrado"
            message="O endereço não corresponde a nenhum curso seu."
            back={{ to: '/instrutor/cursos', label: 'Ir para Meus cursos' }}
          />
        ) : (
          <ErrorState onRetry={() => void course.refetch()} />
        )
      ) : (
        // Keyed: another course's cursors mean nothing to this one.
        course.data && (
          <CourseStudents key={course.data.id} course={course.data} />
        )
      )}
    </section>
  );
}

function CourseStudents({ course }: { course: ManagedCourse }) {
  const pages = useCursorPages<StudentOrder>('desc');
  const students = useCourseStudents(course.id, {
    cursor: pages.cursor,
    order: pages.filter,
  });
  const nextCursor = students.data?.nextCursor;
  const empty = students.data?.items.length === 0 && pages.index === 0;
  const csv = useStudentExport(course.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const exportId = searchParams.get('export');
  const openedExport = useRef<string>(undefined);
  const openExport = useEffectEvent((id: string) => {
    void csv.open(id);
  });

  // The bell's notice leads here with the export; it leaves the address once read, so a reload
  // does not open it again.
  useEffect(() => {
    if (!exportId) {
      openedExport.current = undefined;

      return;
    }

    if (openedExport.current === exportId) {
      return;
    }

    openedExport.current = exportId;
    setSearchParams(
      (params) => {
        params.delete('export');

        return params;
      },
      { replace: true },
    );
    openExport(exportId);
  }, [exportId, setSearchParams]);

  return (
    <>
      <title>{`Alunos · ${course.title} · Coursary`}</title>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-1">
          <span className="text-sm font-bold text-muted-foreground">
            {course.title}
          </span>
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            Alunos
          </h1>
          {!empty && (
            <p className="text-muted-foreground">
              {course.enrollmentCount > 0 &&
                `${CourseFormat.count(course.enrollmentCount, 'aluno matriculado', 'alunos matriculados')} · `}
              {CourseFormat.count(course.lessonCount, 'aula', 'aulas')}
            </p>
          )}
        </div>
        {/* Kept once started: a list that reloads must not take the download link with it. */}
        {!empty &&
          (students.data !== undefined || csv.phase.step !== 'idle') && (
            <StudentsExportButton csv={csv} />
          )}
      </header>
      <StudentsExportStatus csv={csv} />
      {students.isLoading ? (
        <StudentsTableSkeleton />
      ) : students.isError && !students.data ? (
        <div className="flex flex-col items-start gap-3">
          <ErrorState variant="block" onRetry={() => void students.refetch()} />
          {pages.index > 0 && (
            <Button variant="outline" onClick={pages.previous}>
              <ChevronLeft aria-hidden="true" />
              Voltar à página anterior
            </Button>
          )}
        </div>
      ) : empty ? (
        <EmptyState
          icon={Users}
          title="Ninguém se matriculou ainda"
          description={EMPTY_DESCRIPTION[course.status]}
          action={<EmptyAction course={course} />}
        />
      ) : (
        students.data && (
          <section
            aria-label="Lista de alunos"
            aria-busy={students.isPlaceholderData}
            className="animate-content-in overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <BlockBoundary
              title="Não deu para mostrar os alunos"
              resetKeys={[pages.index, pages.filter]}
            >
              <StudentsTable
                students={students.data.items}
                lessonCount={course.lessonCount}
                order={pages.filter}
                onSort={pages.filterBy}
                busy={students.isPlaceholderData}
              />
            </BlockBoundary>
            <StudentsPager
              index={pages.index}
              shown={students.data.items.length}
              total={course.enrollmentCount}
              canNext={!students.isPlaceholderData && Boolean(nextCursor)}
              busy={students.isPlaceholderData}
              onPrevious={pages.previous}
              onNext={() => {
                if (nextCursor) {
                  pages.next(nextCursor);
                }
              }}
            />
          </section>
        )
      )}
    </>
  );
}

// A draft needs no action here: "Voltar ao curso" above already leads to publishing it.
function EmptyAction({ course }: { course: ManagedCourse }) {
  return course.status === 'PUBLISHED' ? (
    <Button variant="outline" asChild>
      <Link to={`/cursos/${course.id}`}>Ver a página do curso</Link>
    </Button>
  ) : null;
}

function StudentsSkeleton() {
  return (
    <>
      <LoadingNote>Carregando os alunos…</LoadingNote>
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <TableSkeleton rows={6} />
      </div>
    </>
  );
}

function StudentsTableSkeleton() {
  return (
    <>
      <LoadingNote>Carregando os alunos…</LoadingNote>
      <TableSkeleton rows={6} />
    </>
  );
}
