import { noop } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import { Link, Navigate } from 'react-router';

import { ErrorState } from '~/components/ErrorState';
import { LessonAttachments } from '~/components/lesson/LessonAttachments';
import { LessonBody } from '~/components/lesson/LessonBody';
import { LessonOutline } from '~/components/lesson/LessonOutline';
import { LessonVideo } from '~/components/lesson/LessonVideo';
import { LoadingNote } from '~/components/LoadingNote';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { queryClient } from '~/lib/queryClient';
import { enrollmentQuery, useEnrollment } from '~/queries/course';
import {
  lessonQuery,
  outlineQuery,
  useLesson,
  useOutline,
} from '~/queries/lesson';
import { ApiFailure } from '~/services/ApiFailure';
import type { Progress } from '~/services/EnrollmentService';
import type { CourseOutline, LessonContent } from '~/services/LessonService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/aula';

// A malformed id is refused as a validation error before the API looks for it.
const COURSE_NOT_FOUND = new Set(['COURSE_NOT_FOUND', 'VALIDATION']);
const LESSON_NOT_FOUND = new Set(['LESSON_NOT_FOUND', 'VALIDATION']);

const lessonsOf = (outline: CourseOutline) =>
  outline.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleIndex,
      moduleTitle: module.title,
    })),
  );

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
    />
  );
}

function LessonView({
  outline,
  progress,
  content,
  lessons,
  index,
  onVideoExpired,
}: {
  outline: CourseOutline;
  progress: Progress;
  content: LessonContent;
  lessons: ReturnType<typeof lessonsOf>;
  index: number;
  onVideoExpired: () => Promise<unknown>;
}) {
  const lesson = lessons[index];
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const renewVideo = useCallback(() => {
    void onVideoExpired();
  }, [onVideoExpired]);

  if (!lesson) {
    return null;
  }

  const hasBody = content.body.trim() !== '';
  const lessonPath = (id: string) => `/cursos/${outline.courseId}/aulas/${id}`;
  // An archived course has no public page; its students reach it from their enrollments.
  const back =
    outline.status === 'PUBLISHED'
      ? { to: `/cursos/${outline.courseId}`, label: outline.title }
      : { to: '/minhas-matriculas', label: 'Minhas matrículas' };

  return (
    <article className="flex flex-col gap-6">
      <Link
        to={back.to}
        className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-md font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronLeft aria-hidden="true" className="size-4.5" />
        {back.label}
      </Link>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <div className="flex min-w-0 flex-col gap-7">
          <header className="flex flex-col gap-1.5">
            <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance md:text-4xl">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">
              Módulo {lesson.moduleIndex + 1} · {lesson.moduleTitle} · Aula{' '}
              {index + 1} de {lessons.length} · {lesson.durationMinutes} min
            </p>
          </header>
          {content.video && (
            <LessonVideo
              title={lesson.title}
              video={content.video}
              onExpired={renewVideo}
            />
          )}
          <LessonLinks
            label="Aulas"
            previous={previous && lessonPath(previous.id)}
            next={next && lessonPath(next.id)}
          />
          {hasBody && (
            <section aria-label="Texto da aula">
              <LessonBody markdown={content.body} />
            </section>
          )}
          {content.attachments.length > 0 && (
            <LessonAttachments
              courseId={outline.courseId}
              lessonId={lesson.id}
              attachments={content.attachments}
            />
          )}
          {(hasBody || content.attachments.length > 0) && (
            <LessonLinks
              label="Aulas, no fim da aula"
              previous={previous && lessonPath(previous.id)}
              next={next && lessonPath(next.id)}
            />
          )}
        </div>
        <LessonOutline
          courseId={outline.courseId}
          modules={outline.modules}
          currentLessonId={lesson.id}
          completedLessonIds={progress.completedLessonIds}
        />
      </div>
    </article>
  );
}

function LessonLinks({
  label,
  previous,
  next,
}: {
  label: string;
  previous: string | undefined;
  next: string | undefined;
}) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label={label}
      className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end"
    >
      {previous && (
        <Button variant="ghost" asChild>
          <Link to={previous} aria-label="Aula anterior">
            <ChevronLeft aria-hidden="true" />
            <span className="sm:hidden">Anterior</span>
            <span className="hidden sm:inline">Aula anterior</span>
          </Link>
        </Button>
      )}
      {next && (
        <Button variant="outline" className="col-start-2" asChild>
          <Link to={next} aria-label="Próxima aula">
            <span className="sm:hidden">Próxima</span>
            <span className="hidden sm:inline">Próxima aula</span>
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      )}
    </nav>
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
