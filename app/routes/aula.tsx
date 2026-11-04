import { noop } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'sonner';

import { ErrorState } from '~/components/ErrorState';
import { LessonAttachments } from '~/components/lesson/LessonAttachments';
import { LessonBody } from '~/components/lesson/LessonBody';
import { LessonCompletion } from '~/components/lesson/LessonCompletion';
import { LessonOutline } from '~/components/lesson/LessonOutline';
import { LessonVideo } from '~/components/lesson/LessonVideo';
import { LoadingNote } from '~/components/LoadingNote';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { queryClient } from '~/lib/queryClient';
import { useCompleteLesson, useSavePosition } from '~/mutations/progress';
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
  const lessonId = lesson?.id ?? '';
  const complete = useCompleteLesson(outline.courseId);
  const savePosition = useSavePosition(outline.courseId, lessonId);
  const done = progress.completedLessonIds.includes(lessonId);
  const renewVideo = useCallback(() => {
    void onVideoExpired();
  }, [onVideoExpired]);
  const hasVideo = content.video !== undefined;

  // A lesson without a video is still the last one opened.
  useEffect(() => {
    if (!hasVideo) {
      savePosition(0);
    }
  }, [hasVideo, savePosition]);

  if (!lesson) {
    return null;
  }

  const completeLesson = () => {
    if (done || complete.isPending) {
      return;
    }

    complete.mutate(lesson.id, {
      onError: () => {
        toast.error('Não deu para marcar a aula. Tente de novo.');
      },
    });
  };

  const strip = (
    <LessonStrip
      courseId={outline.courseId}
      previous={lessons[index - 1]}
      next={lessons[index + 1]}
      done={done}
      pending={complete.isPending}
      onComplete={completeLesson}
    />
  );

  return (
    <article className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21.25rem] lg:gap-10">
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
          <div className="overflow-hidden rounded-md border bg-card shadow-sm">
            <div className="bg-black">
              <LessonVideo
                title={lesson.title}
                video={content.video}
                startAt={
                  progress.lastLessonId === lesson.id
                    ? (progress.positionSeconds ?? undefined)
                    : undefined
                }
                onExpired={renewVideo}
                onPosition={savePosition}
                onEnded={completeLesson}
              />
            </div>
            <div className="border-t">{strip}</div>
          </div>
        )}
        {content.body.trim() !== '' && (
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
        {!content.video && (
          <div className="rounded-md border bg-card shadow-sm">{strip}</div>
        )}
      </div>
      <LessonOutline
        courseId={outline.courseId}
        modules={outline.modules}
        currentLessonId={lesson.id}
        completedLessonIds={progress.completedLessonIds}
      />
    </article>
  );
}

type OutlineLesson = ReturnType<typeof lessonsOf>[number];

function LessonStrip({
  courseId,
  previous,
  next,
  done,
  pending,
  onComplete,
}: {
  courseId: string;
  previous: OutlineLesson | undefined;
  next: OutlineLesson | undefined;
  done: boolean;
  pending: boolean;
  onComplete: () => void;
}) {
  const lessonPath = (id: string) => `/cursos/${courseId}/aulas/${id}`;

  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pl-4">
      <LessonCompletion done={done} pending={pending} onComplete={onComplete} />
      {(previous ?? next) && (
        <nav
          aria-label="Aulas"
          className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2"
        >
          {previous && (
            <Button variant="ghost" asChild>
              <Link
                to={lessonPath(previous.id)}
                aria-label={`Aula anterior: ${previous.title}`}
              >
                <ChevronLeft aria-hidden="true" />
                Anterior
              </Link>
            </Button>
          )}
          {next && (
            <Button
              variant={done ? 'default' : 'outline'}
              className="col-start-2 h-auto min-h-13 justify-between gap-3 py-1.5 pr-3.5 pl-4 text-left whitespace-normal"
              asChild
            >
              <Link
                to={lessonPath(next.id)}
                aria-label={`Próxima aula: ${next.title}`}
              >
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-xs font-normal opacity-80">
                    Próxima aula
                  </span>
                  <span className="truncate">{next.title}</span>
                </span>
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          )}
        </nav>
      )}
    </div>
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
