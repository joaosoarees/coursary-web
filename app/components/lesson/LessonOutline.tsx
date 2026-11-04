import { ChevronDown, Circle, CircleCheck, CirclePlay } from 'lucide-react';
import { useId, useState } from 'react';
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
  const listId = useId();
  const completed = new Set(completedLessonIds);
  const total = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const done = modules.reduce(
    (sum, module) =>
      sum + module.lessons.filter((lesson) => completed.has(lesson.id)).length,
    0,
  );
  const progress = <CourseProgress completed={done} total={total} />;

  return (
    <aside
      aria-labelledby={`${listId}-title`}
      className="flex flex-col gap-4.5 rounded-md border bg-card px-3 pt-5 pb-4 shadow-sm"
    >
      <div className="hidden flex-col gap-2.5 px-2 lg:flex">
        <h2 id={`${listId}-title`} className="font-display text-xl font-bold">
          Conteúdo do curso
        </h2>
        {progress}
      </div>
      {/* On a phone the outline comes after the lesson, closed, so the lesson stays first. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className="flex items-center gap-3 rounded-md px-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="font-display text-xl font-bold">
            Conteúdo do curso
          </span>
          {progress}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      <ol
        id={listId}
        className={cn('flex-col gap-3.5', open ? 'flex' : 'hidden lg:flex')}
      >
        {modules.map((module, index) => (
          <li key={module.id} className="flex flex-col gap-1">
            <h3 className="flex justify-between gap-3 px-2 text-[0.9375rem] font-bold">
              <span>
                {index + 1}. {module.title}
              </span>
              <span className="shrink-0 text-sm font-normal text-muted-foreground">
                {
                  module.lessons.filter((lesson) => completed.has(lesson.id))
                    .length
                }{' '}
                de {module.lessons.length}
              </span>
            </h3>
            <ol className="flex flex-col">
              {module.lessons.map((lesson) => {
                const current = lesson.id === currentLessonId;

                return (
                  <li key={lesson.id}>
                    <Link
                      to={`/cursos/${courseId}/aulas/${lesson.id}`}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-2.5 rounded-md p-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
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
