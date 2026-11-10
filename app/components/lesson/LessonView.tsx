import { noop, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { BlockBoundary } from '~/components/BlockBoundary';
import { ReviewButton } from '~/components/course/ReviewButton';
import { ReviewDialog } from '~/components/course/ReviewDialog';
import { LessonAttachments } from '~/components/lesson/LessonAttachments';
import { LessonBody } from '~/components/lesson/LessonBody';
import { LessonCompletion } from '~/components/lesson/LessonCompletion';
import { LessonOutline } from '~/components/lesson/LessonOutline';
import { LessonVideo } from '~/components/lesson/LessonVideo';
import {
  QuestionsSection,
  type QuestionsViewer,
} from '~/components/questions/QuestionsSection';
import { Button } from '~/components/ui/button';
import { useCompleteLesson, useSavePosition } from '~/mutations/progress';
import { myReviewQuery } from '~/queries/course';
import type { Progress } from '~/services/EnrollmentService';
import type { CourseOutline, LessonContent } from '~/services/LessonService';

export const lessonsOf = (outline: CourseOutline) =>
  outline.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleIndex,
      moduleTitle: module.title,
    })),
  );

export type OutlineLesson = ReturnType<typeof lessonsOf>[number];

// The student's lesson, or the instructor's preview of it (no progress: nothing is marked, kept or
// reviewed there).
export function LessonView({
  outline,
  progress,
  content,
  lessons,
  index,
  onVideoExpired,
  lessonPath,
  questionsViewer,
}: {
  outline: CourseOutline;
  progress: Progress | undefined;
  content: LessonContent;
  lessons: OutlineLesson[];
  index: number;
  onVideoExpired: () => Promise<unknown>;
  lessonPath: (lessonId: string) => string;
  questionsViewer?: QuestionsViewer;
}) {
  const preview = progress === undefined;
  const lesson = lessons[index];
  const lessonId = lesson?.id ?? '';
  const complete = useCompleteLesson(outline.courseId);
  const savePosition = useSavePosition(outline.courseId, lessonId);
  const done = progress?.completedLessonIds.includes(lessonId) ?? false;
  const renewVideo = useCallback(() => {
    void onVideoExpired();
  }, [onVideoExpired]);
  const hasVideo = content.video !== undefined;
  const nextLink = useRef<HTMLAnchorElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const client = useQueryClient();
  const [suggestReview, setSuggestReview] = useState(false);

  // A lesson without a video is still the last one opened.
  useEffect(() => {
    if (!hasVideo && !preview) {
      savePosition(0);
    }
  }, [hasVideo, preview, savePosition]);

  if (!lesson) {
    return null;
  }

  const completeLesson = () => {
    if (preview || done || complete.isPending) {
      return;
    }

    complete.mutate(lesson.id, {
      // The box the student just ticked goes away: hand the focus to the next step.
      onSuccess: ({ completedLessons }) => {
        nextLink.current?.focus();

        // The last lesson closes the course: the review is suggested then, once, if there is none.
        if (completedLessons >= lessons.length) {
          void client
            .query(myReviewQuery(outline.courseId))
            .then((review) => {
              if (review === null) {
                setSuggestReview(true);
              }
            })
            .catch(noop);
        }
      },
      onError: () => {
        toast.error('Não deu para marcar a aula. Tente de novo.');
      },
    });
  };

  // A preview of a course's only lesson has nothing to put in the strip.
  const hasStrip =
    !preview ||
    lessons[index - 1] !== undefined ||
    lessons[index + 1] !== undefined;
  const strip = (
    <LessonStrip
      lessonPath={lessonPath}
      preview={preview}
      previous={lessons[index - 1]}
      next={lessons[index + 1]}
      done={done}
      pending={complete.isPending}
      onComplete={completeLesson}
      nextLink={nextLink}
    />
  );

  return (
    <article className="grid animate-content-in items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21.25rem] lg:gap-10">
      <div className="flex min-w-0 flex-col gap-7">
        <header className="flex flex-col gap-1.5">
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance md:text-4xl">
            {lesson.title}
          </h1>
          <p className="text-muted-foreground">
            <span className="whitespace-nowrap">
              Módulo {lesson.moduleIndex + 1} · {lesson.moduleTitle}
            </span>{' '}
            ·{' '}
            <span className="whitespace-nowrap">
              Aula {index + 1} de {lessons.length}
            </span>{' '}
            ·{' '}
            <span className="whitespace-nowrap">
              {lesson.durationMinutes} min
            </span>
          </p>
        </header>
        {content.video && (
          <div className="overflow-hidden rounded-md border bg-card shadow-sm">
            <div className="bg-black">
              <BlockBoundary title="Não deu para mostrar o vídeo">
                <LessonVideo
                  title={lesson.title}
                  video={content.video}
                  startAt={
                    progress?.lastLessonId === lesson.id
                      ? (progress.positionSeconds ?? undefined)
                      : undefined
                  }
                  onExpired={renewVideo}
                  onPosition={preview ? undefined : savePosition}
                  onEnded={preview ? undefined : completeLesson}
                />
              </BlockBoundary>
            </div>
            {hasStrip && <div className="border-t">{strip}</div>}
          </div>
        )}
        {preview && !content.video && content.body.trim() === '' && (
          <p className="text-muted-foreground">
            Esta aula ainda não tem vídeo nem texto.
          </p>
        )}
        {content.body.trim() !== '' && (
          <section aria-label="Texto da aula">
            <BlockBoundary title="Não deu para mostrar o texto da aula">
              <LessonBody markdown={content.body} />
            </BlockBoundary>
          </section>
        )}
        {content.attachments.length > 0 && (
          <BlockBoundary title="Não deu para mostrar o material">
            <LessonAttachments
              courseId={outline.courseId}
              lessonId={lesson.id}
              attachments={content.attachments}
            />
          </BlockBoundary>
        )}
        {!content.video && hasStrip && (
          <div className="rounded-md border bg-card shadow-sm">{strip}</div>
        )}
        {questionsViewer && (
          <BlockBoundary title="Não deu para mostrar as perguntas">
            <QuestionsSection
              courseId={outline.courseId}
              lessonId={lesson.id}
              courseStatus={outline.status}
              viewer={questionsViewer}
            />
          </BlockBoundary>
        )}
      </div>
      <BlockBoundary title="Não deu para mostrar o conteúdo do curso">
        <LessonOutline
          courseId={outline.courseId}
          modules={outline.modules}
          currentLessonId={lesson.id}
          completedLessonIds={progress?.completedLessonIds ?? []}
          preview={preview}
          lessonPath={lessonPath}
          footer={
            preview ? undefined : (
              <ReviewButton
                ref={reviewButton}
                courseId={outline.courseId}
                courseTitle={outline.title}
              />
            )
          }
        />
      </BlockBoundary>
      {!preview && (
        <ReviewDialog
          courseId={outline.courseId}
          courseTitle={outline.title}
          review={null}
          finished
          open={suggestReview}
          onOpenChange={setSuggestReview}
          // The box that opened it went away with the last lesson: land on the review button.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            reviewButton.current?.focus();
          }}
        />
      )}
    </article>
  );
}

function LessonStrip({
  lessonPath,
  preview,
  previous,
  next,
  done,
  pending,
  onComplete,
  nextLink,
}: {
  lessonPath: (lessonId: string) => string;
  preview: boolean;
  previous: OutlineLesson | undefined;
  next: OutlineLesson | undefined;
  done: boolean;
  pending: boolean;
  onComplete: () => void;
  nextLink: React.Ref<HTMLAnchorElement>;
}) {
  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pl-4">
      {!preview && (
        <LessonCompletion
          done={done}
          pending={pending}
          onComplete={onComplete}
        />
      )}
      {(previous ?? next) && (
        <nav
          aria-label="Aulas"
          className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 max-[22.5rem]:grid-cols-1 sm:flex sm:flex-wrap sm:items-center sm:gap-2"
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
              className="col-start-2 h-auto min-h-13 justify-between gap-3 py-1.5 pr-3.5 pl-4 text-left whitespace-normal max-[22.5rem]:col-start-1"
              asChild
            >
              <Link
                ref={nextLink}
                to={lessonPath(next.id)}
                aria-label={`Próxima aula: ${next.title}`}
              >
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-xs font-normal opacity-80">
                    Próxima aula
                  </span>
                  <span className="line-clamp-2 sm:line-clamp-1">
                    {next.title}
                  </span>
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
