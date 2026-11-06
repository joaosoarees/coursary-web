import { noop } from '@tanstack/react-query';
import { Eye } from 'lucide-react';

import { ErrorState } from '~/components/ErrorState';
import { lessonsOf, LessonView } from '~/components/lesson/LessonView';
import { LoadingNote } from '~/components/LoadingNote';
import { Skeleton } from '~/components/ui/skeleton';
import { queryClient } from '~/lib/queryClient';
import {
  lessonQuery,
  outlineQuery,
  useLesson,
  useOutline,
} from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/previa-aula';

const NOT_MINE = new Set([
  'COURSE_NOT_FOUND',
  'LESSON_NOT_FOUND',
  'VALIDATION',
  'FORBIDDEN',
]);

export const meta: Route.MetaFunction = () => [
  { title: 'Prévia da aula · Coursary' },
];

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (isSignedIn()) {
    void queryClient.query(outlineQuery(params.id)).catch(noop);
    void queryClient.query(lessonQuery(params.id, params.aulaId)).catch(noop);
  }

  return null;
}

export default function LessonPreviewRoute({ params }: Route.ComponentProps) {
  const outline = useOutline(params.id);
  const lesson = useLesson(params.id, params.aulaId);
  const queries = [outline, lesson];
  const failed = queries.find((query) => query.isError);
  const notFound = (
    <ErrorState
      title="Aula não encontrada"
      message="O endereço não corresponde a nenhuma aula de um curso seu."
      back={{ to: '/instrutor/cursos', label: 'Ir para Meus cursos' }}
    />
  );

  if (failed) {
    return NOT_MINE.has(ApiFailure.codeOf(failed.error) ?? '') ? (
      notFound
    ) : (
      <ErrorState
        onRetry={() => {
          void outline.refetch();
          void lesson.refetch();
        }}
      />
    );
  }

  if (!outline.data || !lesson.data) {
    return <PreviewSkeleton />;
  }

  const lessons = lessonsOf(outline.data);
  const index = lessons.findIndex(({ id }) => id === params.aulaId);

  if (index === -1) {
    return notFound;
  }

  return (
    <div className="flex flex-col gap-6">
      <p
        role="note"
        className="flex items-start gap-2.5 rounded-lg border border-input bg-muted px-4 py-3"
      >
        <Eye aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <span>
          <strong>Prévia:</strong> é assim que o aluno vê esta aula. Nada do que
          você fizer aqui fica salvo.
        </span>
      </p>
      <LessonView
        key={params.aulaId}
        outline={outline.data}
        progress={undefined}
        content={lesson.data}
        lessons={lessons}
        index={index}
        onVideoExpired={lesson.refetch}
        lessonPath={(id) => `/instrutor/cursos/${params.id}/aulas/${id}/previa`}
      />
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <>
      <LoadingNote>Carregando a prévia…</LoadingNote>
      <div
        aria-hidden="true"
        className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_21.25rem]"
      >
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="aspect-video w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </>
  );
}
