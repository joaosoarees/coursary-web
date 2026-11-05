import { noop } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { ChalkStroke } from '~/components/ChalkStroke';
import { ErrorState } from '~/components/ErrorState';
import {
  MyCourseCard,
  MyCourseCardSkeleton,
} from '~/components/instructor/MyCourseCard';
import { LoadingNote } from '~/components/LoadingNote';
import { LoadMore } from '~/components/LoadMore';
import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/ui/button';
import { queryClient } from '~/lib/queryClient';
import { myCoursesQuery, useMyCourses } from '~/queries/instructor';
import type { MyCourse } from '~/services/InstructorService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/meus-cursos';

export const meta: Route.MetaFunction = () => [
  { title: 'Meus cursos · Coursary' },
];

const NO_COURSES: MyCourse[] = [];

export function clientLoader() {
  if (isSignedIn()) {
    void queryClient.infiniteQuery(myCoursesQuery).catch(noop);
  }

  return null;
}

export default function MyCoursesPage() {
  const list = useMyCourses();
  const courses = list.data?.pages.flatMap((page) => page.items) ?? NO_COURSES;
  // Hidden until the list answers, so it never appears and then gives way to the empty state.
  const showNewCourse = courses.length > 0 || list.isLoadingError;

  return (
    <section className="flex flex-col gap-7">
      <PageHeader
        title="Meus cursos"
        description="Os cursos que você criou, do rascunho ao arquivado."
        actions={
          showNewCourse && (
            <Button asChild>
              <Link to="/instrutor/cursos/novo">
                <Plus aria-hidden="true" />
                Novo curso
              </Link>
            </Button>
          )
        }
      />
      <CourseList list={list} courses={courses} />
    </section>
  );
}

function CourseList({
  list,
  courses,
}: {
  list: ReturnType<typeof useMyCourses>;
  courses: MyCourse[];
}) {
  const { isLoading, isLoadingError, refetch } = list;

  if (isLoading) {
    return (
      <>
        <LoadingNote>Carregando seus cursos…</LoadingNote>
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <MyCourseCardSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  if (isLoadingError) {
    return (
      <ErrorState
        variant="block"
        title="Não deu para carregar seus cursos"
        onRetry={() => void refetch()}
      />
    );
  }

  if (courses.length === 0) {
    return <FirstCourse />;
  }

  return (
    <div className="flex flex-col gap-7">
      <ul className="flex flex-col gap-3">
        {courses.map((course) => (
          <li key={course.id}>
            <MyCourseCard course={course} />
          </li>
        ))}
      </ul>
      <LoadMore
        list={list}
        labels={{
          more: 'Carregar mais cursos',
          loading: 'Carregando mais cursos…',
          failed: 'Não deu para carregar mais cursos.',
        }}
        className="items-center"
      />
    </div>
  );
}

function FirstCourse() {
  return (
    <div className="flex max-w-180 flex-col items-start gap-4 rounded-lg bg-board px-8 py-10 text-chalk ring-1 ring-chalk/10 ring-inset">
      <ChalkStroke className="w-44 text-chalk-yellow" />
      <h2 className="font-display text-3xl leading-tight font-bold tracking-tight">
        Você ainda não criou nenhum curso
      </h2>
      <p className="max-w-[52ch] text-shell-muted">
        Comece pelo título e pela descrição. O curso nasce como rascunho e só
        aparece no catálogo quando você publicar.
      </p>
      <Link
        to="/instrutor/cursos/novo"
        className="inline-flex h-11 items-center gap-2 rounded-md bg-chalk-yellow px-4.5 font-bold text-chalk-yellow-foreground hover:bg-chalk-yellow/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow"
      >
        <Plus aria-hidden="true" className="size-4.5" />
        Criar o primeiro curso
      </Link>
    </div>
  );
}
