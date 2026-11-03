import { noop } from '@tanstack/react-query';
import { Link } from 'react-router';

import { BoardIcon } from '~/components/BoardIcon';
import { EnrollmentCard } from '~/components/course/EnrollmentCard';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { LoadMore } from '~/components/LoadMore';
import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { queryClient } from '~/lib/queryClient';
import { myEnrollmentsQuery, useMyEnrollments } from '~/queries/enrollments';
import type { EnrollmentSummary } from '~/services/EnrollmentService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/minhas-matriculas';

export const meta: Route.MetaFunction = () => [
  { title: 'Minhas matrículas · Coursary' },
];

const NO_ENROLLMENTS: EnrollmentSummary[] = [];

export async function clientLoader() {
  if (isSignedIn()) {
    await queryClient.infiniteQuery(myEnrollmentsQuery).catch(noop);
  }

  return null;
}

export default function MyEnrollmentsPage() {
  const list = useMyEnrollments();
  const enrollments =
    list.data?.pages.flatMap((page) => page.items) ?? NO_ENROLLMENTS;
  const none = list.isSuccess && enrollments.length === 0;

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title="Minhas matrículas"
        description={
          none
            ? 'Os cursos em que você está matriculado.'
            : 'Os cursos em que você está matriculado, com o seu progresso.'
        }
      />
      <EnrollmentList list={list} enrollments={enrollments} />
    </section>
  );
}

function EnrollmentList({
  list,
  enrollments,
}: {
  list: ReturnType<typeof useMyEnrollments>;
  enrollments: EnrollmentSummary[];
}) {
  const { isLoading, isLoadingError, refetch } = list;

  if (isLoading) {
    return (
      <>
        <LoadingNote>Carregando suas matrículas…</LoadingNote>
        <div aria-hidden="true" className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex flex-col gap-5 rounded-md border p-4 md:flex-row"
            >
              <Skeleton className="aspect-video w-full md:w-55 md:shrink-0" />
              <div className="flex flex-1 flex-col justify-center gap-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-2 w-full max-w-90" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isLoadingError) {
    return (
      <ErrorState
        variant="block"
        title="Não deu para carregar suas matrículas"
        onRetry={() => void refetch()}
      />
    );
  }

  if (enrollments.length === 0) {
    return (
      <EmptyState
        icon={BoardIcon}
        title="Você ainda não se matriculou em nenhum curso"
        description="Os cursos em que você se matricular aparecem aqui, com o seu progresso."
        action={
          <Button asChild>
            <Link to="/cursos">Explorar o catálogo</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <ul className="flex flex-col gap-4">
        {enrollments.map((enrollment) => (
          <li key={enrollment.courseId}>
            <EnrollmentCard enrollment={enrollment} />
          </li>
        ))}
      </ul>
      <LoadMore
        list={list}
        labels={{
          more: 'Carregar mais matrículas',
          loading: 'Carregando mais matrículas…',
          failed: 'Não deu para carregar mais matrículas.',
        }}
        className="items-center"
      />
    </div>
  );
}
