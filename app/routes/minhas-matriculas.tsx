import { noop } from '@tanstack/react-query';
import { MonitorPlay } from 'lucide-react';
import { Link } from 'react-router';

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
  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title="Minhas matrículas"
        description="Os cursos em que você está matriculado, com o seu progresso."
      />
      <EnrollmentList />
    </section>
  );
}

function EnrollmentList() {
  const list = useMyEnrollments();
  const { data, isLoading, isLoadingError, refetch } = list;
  const enrollments =
    data?.pages.flatMap((page) => page.items) ?? NO_ENROLLMENTS;

  if (isLoading) {
    return (
      <>
        <LoadingNote>Carregando suas matrículas…</LoadingNote>
        <div aria-hidden="true" className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
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
        icon={MonitorPlay}
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
