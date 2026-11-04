import { ChevronDown, Circle, CircleCheck, CirclePlay } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';

import { CourseProgress } from '~/components/course/CourseProgress';
import { cn } from '~/lib/utils';
import type { CourseModule } from '~/services/CourseService';

export function LessonOutline({
  courseId,
  modules,
  currentLessonId,
  completedLessonIds,
}: {
  courseId: string;
  modules: CourseModule[];
  currentLessonId: string;
  completedLessonIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(
    () =>
      new Set(
        modules
          .filter((module) =>
            module.lessons.some((lesson) => lesson.id === currentLessonId),
          )
          .map((module) => module.id),
      ),
  );
  const toggle = (moduleId: string) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (!next.delete(moduleId)) {
        next.add(moduleId);
      }

      return next;
    });
  };
  const listId = useId();
  const list = useRef<HTMLOListElement>(null);
  const currentLink = useRef<HTMLAnchorElement>(null);

  // A long course scrolls inside the card; the lesson on screen starts in view, without moving the page.
  useEffect(() => {
    const box = list.current;
    const link = currentLink.current;

    if (!box || !link || box.scrollHeight <= box.clientHeight) {
      return;
    }

    box.scrollTop = link.offsetTop - box.clientHeight / 2;
  }, [currentLessonId]);
  const completed = new Set(completedLessonIds);
  const total = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const done = modules.reduce(
    (sum, module) =>
      sum + module.lessons.filter((lesson) => completed.has(lesson.id)).length,
    0,
  );
  const progress = <CourseProgress completed={done} total={total} spelledOut />;

  return (
    <aside
      aria-labelledby={`${listId}-title`}
      className="flex flex-col gap-4.5 rounded-md border bg-card px-3 pt-5 pb-4 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)]"
    >
      <div className="hidden flex-col gap-2.5 px-2 lg:flex">
        <h2 id={`${listId}-title`} className="font-display text-xl font-bold">
          Conteúdo do curso
        </h2>
        {progress}
      </div>
      <div className="flex flex-col gap-2.5 px-2 lg:hidden">
        <h2 className="font-display text-xl font-bold">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => {
              setOpen((value) => !value);
            }}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Conteúdo do curso
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
                open && 'rotate-180',
              )}
            />
          </button>
        </h2>
        {progress}
      </div>
      <ol
        ref={list}
        id={listId}
        className={cn(
          'relative flex-col gap-3 lg:min-h-0 lg:overflow-y-auto',
          open ? 'flex' : 'hidden lg:flex',
        )}
      >
        {modules.map((module, index) => (
          <li key={module.id} className="flex flex-col gap-0.5">
            <h3>
              <button
                type="button"
                aria-expanded={expanded.has(module.id)}
                aria-controls={`${listId}-${module.id}`}
                onClick={() => {
                  toggle(module.id);
                }}
                className="flex min-h-11 w-full items-center gap-2.5 rounded-md p-2 text-left font-bold hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span className="min-w-0 flex-1">
                  {index + 1}. {module.title}
                </span>
                <span className="shrink-0 text-sm font-normal text-muted-foreground">
                  {
                    module.lessons.filter((lesson) => completed.has(lesson.id))
                      .length
                  }{' '}
                  de {module.lessons.length}
                  <span className="sr-only"> concluídas</span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-4.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
                    expanded.has(module.id) && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <ol
              id={`${listId}-${module.id}`}
              hidden={!expanded.has(module.id)}
              className="flex flex-col [&[hidden]]:hidden"
            >
              {module.lessons.map((lesson) => {
                const current = lesson.id === currentLessonId;

                return (
                  <li key={lesson.id}>
                    <Link
                      to={`/cursos/${courseId}/aulas/${lesson.id}`}
                      ref={current ? currentLink : undefined}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-2.5 rounded-md p-2 hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                        current && 'bg-muted font-bold',
                      )}
                    >
                      <LessonMark
                        current={current}
                        done={completed.has(lesson.id)}
                      />
                      <span className="min-w-0 flex-1 leading-snug">
                        {lesson.title}
                      </span>
                      <span className="shrink-0 text-sm font-normal text-muted-foreground">
                        {lesson.durationMinutes} min
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function LessonMark({ current, done }: { current: boolean; done: boolean }) {
  if (current) {
    return (
      <CirclePlay
        aria-hidden="true"
        className="size-4.5 shrink-0 text-primary"
      />
    );
  }

  if (done) {
    return (
      <CircleCheck
        role="img"
        aria-label="Concluída"
        className="size-4.5 shrink-0 text-success"
      />
    );
  }

  return <Circle aria-hidden="true" className="size-4.5 shrink-0 text-input" />;
}
