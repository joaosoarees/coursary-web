import { noop } from '@tanstack/react-query';
import { Archive, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { Skeleton } from '~/components/ui/skeleton';
import { ContentOrder } from '~/instructor/content/ContentOrder';
import { LessonForm } from '~/instructor/lesson/LessonForm';
import { queryClient } from '~/lib/queryClient';
import { managedCourseQuery, useManagedCourse } from '~/queries/instructor';
import {
  lessonQuery,
  outlineQuery,
  useLesson,
  useOutline,
} from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import type { CourseModule } from '~/services/CourseService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/editar-aula';

const NOT_MINE = new Set([
  'COURSE_NOT_FOUND',
  'LESSON_NOT_FOUND',
  'VALIDATION',
  'FORBIDDEN',
]);

export const meta: Route.MetaFunction = () => [
  { title: 'Editar aula · Coursary' },
];

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (isSignedIn()) {
    void queryClient.query(managedCourseQuery(params.id)).catch(noop);
    void queryClient.query(outlineQuery(params.id)).catch(noop);
    void queryClient.query(lessonQuery(params.id, params.aulaId)).catch(noop);
  }

  return null;
}

class LessonPlace {
  static find(modules: CourseModule[], lessonId: string) {
    const firstNumbers = ContentOrder.firstNumbers(modules);

    for (const [index, module] of modules.entries()) {
      const position = module.lessons.findIndex((each) => each.id === lessonId);
      const lesson = module.lessons[position];

      if (lesson) {
        return {
          module,
          moduleNumber: index + 1,
          lesson,
          number: (firstNumbers[index] ?? 1) + position,
        };
      }
    }

    return undefined;
  }
}

export default function EditLessonPage({ params }: Route.ComponentProps) {
  const course = useManagedCourse(params.id);
  const outline = useOutline(params.id);
  const content = useLesson(params.id, params.aulaId);
  const place = outline.data
    ? LessonPlace.find(outline.data.modules, params.aulaId)
    : undefined;
  const failed = [course, outline, content].find((query) => query.isError);

  return (
    <section className="flex flex-col gap-6">
      <Link
        to={`/instrutor/cursos/${params.id}`}
        className="inline-flex min-h-10 items-center gap-1.5 self-start font-bold text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {course.data?.title ?? 'Voltar ao curso'}
      </Link>
      {failed ? (
        NOT_MINE.has(ApiFailure.codeOf(failed.error) ?? '') ? (
          <ErrorState
            title="Aula não encontrada"
            message="O endereço não corresponde a nenhuma aula de um curso seu."
            back={{ to: '/instrutor/cursos', label: 'Ir para Meus cursos' }}
          />
        ) : (
          <ErrorState
            onRetry={() => {
              void course.refetch();
              void outline.refetch();
              void content.refetch();
            }}
          />
        )
      ) : !course.data || !outline.data || !content.data ? (
        <LessonSkeleton />
      ) : !place ? (
        <ErrorState
          title="Aula não encontrada"
          message="A aula foi apagada ou não é deste curso."
          back={{
            to: `/instrutor/cursos/${params.id}`,
            label: 'Voltar ao curso',
          }}
        />
      ) : (
        <>
          <header className="flex flex-col gap-1.5">
            <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance md:text-4xl">
              {place.lesson.title}
            </h1>
            <p className="text-muted-foreground">
              Módulo {place.moduleNumber} · Aula {place.number}
            </p>
          </header>
          {course.data.status === 'ARCHIVED' && (
            <div
              role="note"
              className="flex max-w-prose items-start gap-3 rounded-lg border bg-muted px-5 py-4"
            >
              <Archive aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p>
                O curso foi arquivado: a aula fica visível para os alunos
                matriculados, mas não pode mais ser editada.
              </p>
            </div>
          )}
          <LessonForm
            courseId={params.id}
            moduleId={place.module.id}
            lessonId={params.aulaId}
            readOnly={course.data.status === 'ARCHIVED'}
            saved={{
              title: place.lesson.title,
              durationMinutes: place.lesson.durationMinutes,
              body: content.data.body,
            }}
          />
        </>
      )}
    </section>
  );
}

function LessonSkeleton() {
  return (
    <>
      <LoadingNote>Carregando a aula…</LoadingNote>
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-2/3" />
        </div>
        <Skeleton className="h-[34rem]" />
      </div>
    </>
  );
}
