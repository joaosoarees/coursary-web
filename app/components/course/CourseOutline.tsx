import { Circle, CircleCheck, CirclePlay, Play } from 'lucide-react';
import { Link } from 'react-router';

import { CourseFormat } from '~/components/course/CourseFormat';
import { Resume } from '~/components/lesson/Resume';
import { cn } from '~/lib/utils';
import type { CourseModule } from '~/services/CourseService';
import type { Progress } from '~/services/EnrollmentService';

const ROW = 'flex min-h-12 items-center gap-3 px-4 py-2.5';

const minutesOf = (lessons: CourseModule['lessons']) =>
  lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0);

export function CourseOutline({
  courseId,
  modules,
  progress,
}: {
  courseId: string;
  modules: CourseModule[];
  progress?: Progress | null;
}) {
  const completed = new Set(progress?.completedLessonIds);
  const resume = progress ? Resume.of(modules, progress) : null;
  const here = resume && !resume.finished ? resume.lessonId : undefined;

  return (
    <ol className="overflow-hidden rounded-md border bg-card">
      {modules.map((module, index) => {
        const finished = module.lessons.filter((lesson) =>
          completed.has(lesson.id),
        ).length;

        return (
          <li key={module.id} className="border-t first:border-t-0">
            <h3 className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 bg-muted/50 px-4 py-3 font-bold">
              <span>
                {index + 1}. {module.title}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {CourseFormat.count(module.lessons.length, 'aula', 'aulas')} ·{' '}
                {CourseFormat.duration(minutesOf(module.lessons))}
                {progress &&
                  ` · ${String(finished)} de ${String(module.lessons.length)} concluídas`}
              </span>
            </h3>
            <ol>
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="border-t">
                  {progress ? (
                    <Link
                      to={`/cursos/${courseId}/aulas/${lesson.id}`}
                      className={cn(
                        ROW,
                        'hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                        lesson.id === here && 'bg-muted font-bold',
                      )}
                    >
                      <LessonState
                        done={completed.has(lesson.id)}
                        here={lesson.id === here}
                      />
                      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 gap-y-0.5 leading-snug">
                        <span>{lesson.title}</span>
                        {lesson.id === here && (
                          <span className="text-sm font-bold text-link">
                            Você parou aqui
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-normal text-muted-foreground">
                        {lesson.durationMinutes} min
                      </span>
                    </Link>
                  ) : (
                    <div className={ROW}>
                      <Play
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                      <span className="min-w-0 flex-1 leading-snug">
                        {lesson.title}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {lesson.durationMinutes} min
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

function LessonState({ done, here }: { done: boolean; here: boolean }) {
  if (here) {
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
