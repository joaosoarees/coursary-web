import { noop } from '@tanstack/react-query';
import { Navigate } from 'react-router';

import { ErrorState } from '~/components/ErrorState';
import { lessonsOf, LessonView } from '~/components/lesson/LessonView';
import { LoadingNote } from '~/components/LoadingNote';
import { Skeleton } from '~/components/ui/skeleton';
import { queryClient } from '~/lib/queryClient';
import {
  enrollmentQuery,
  myReviewQuery,
  useEnrollment,
} from '~/queries/course';
import {
  lessonQuery,
  outlineQuery,
  useLesson,
  useOutline,
} from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/aula';

// A malformed id is refused as a validation error before the API looks for it.
const COURSE_NOT_FOUND = new Set(['COURSE_NOT_FOUND', 'VALIDATION']);
const LESSON_NOT_FOUND = new Set(['LESSON_NOT_FOUND', 'VALIDATION']);

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: `${loaderData?.title ?? 'Aula'} · Coursary` },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!isSignedIn()) {
    return null;
  }

  const [outline] = await Promise.all([
    queryClient.query(outlineQuery(params.id)).catch(noop),
    queryClient.query(enrollmentQuery(params.id)).catch(noop),
    queryClient.query(lessonQuery(params.id, params.aulaId)).catch(noop),
  ]);
  void queryClient.query(myReviewQuery(params.id)).catch(noop);
  const lesson = outline
    ? lessonsOf(outline).find(({ id }) => id === params.aulaId)
    : undefined;

  return { title: lesson?.title };
}

export default function LessonRoute({ params }: Route.ComponentProps) {
  const outline = useOutline(params.id);
  const enrollment = useEnrollment(params.id);
  const lesson = useLesson(params.id, params.aulaId);
  const queries = [outline, enrollment, lesson];

  if (queries.some((query) => query.isLoading)) {
    return <LessonSkeleton />;
  }

  const courseCode = ApiFailure.codeOf(outline.error);
  const lessonCode = ApiFailure.codeOf(lesson.error);

  if (
    enrollment.data === null ||
    courseCode === 'FORBIDDEN' ||
    lessonCode === 'FORBIDDEN'
  ) {
    return <Navigate to={`/cursos/${params.id}`} replace />;
  }

  if (courseCode !== undefined && COURSE_NOT_FOUND.has(courseCode)) {
    return (
      <ErrorState
        title="Curso não encontrado"
        message="O endereço não corresponde a nenhum curso em que você esteja matriculado."
        back={{ to: '/minhas-matriculas', label: 'Minhas matrículas' }}
      />
    );
  }

  const notFound = (
    <ErrorState
      title="Aula não encontrada"
      message="Esta aula não existe mais ou não faz parte do curso."
      back={{ to: `/cursos/${params.id}`, label: 'Voltar ao curso' }}
    />
  );

  if (lessonCode !== undefined && LESSON_NOT_FOUND.has(lessonCode)) {
    return notFound;
  }

  if (queries.some((query) => query.isLoadingError)) {
    return (
      <ErrorState
        onRetry={() => {
          for (const query of queries) {
            if (query.isLoadingError) {
              void query.refetch();
            }
          }
        }}
      />
    );
  }

  if (!outline.data || !enrollment.data || !lesson.data) {
    return null;
  }

  const lessons = lessonsOf(outline.data);
  const index = lessons.findIndex(({ id }) => id === params.aulaId);

  if (index === -1) {
    return notFound;
  }

  return (
    <LessonView
      key={params.aulaId}
      outline={outline.data}
      progress={enrollment.data}
      content={lesson.data}
      lessons={lessons}
      index={index}
      onVideoExpired={lesson.refetch}
      lessonPath={(id) => `/cursos/${params.id}/aulas/${id}`}
    />
  );
}

function LessonSkeleton() {
  return (
    <>
      <LoadingNote>Carregando a aula…</LoadingNote>
      <div
        aria-hidden="true"
        className="grid items-start gap-10 pt-16 lg:grid-cols-[minmax(0,1fr)_21.25rem]"
      >
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="aspect-video w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </>
  );
}
