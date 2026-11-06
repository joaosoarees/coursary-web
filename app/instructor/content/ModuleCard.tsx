import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { useId, useState } from 'react';
import { toast } from 'sonner';

import { CourseFormat } from '~/components/course/CourseFormat';
import { Button } from '~/components/ui/button';
import { DragHandle } from '~/instructor/content/DragHandle';
import { LessonRow } from '~/instructor/content/LessonRow';
import { ModuleTitleForm } from '~/instructor/content/ModuleTitleForm';
import { MoveButtons } from '~/instructor/content/MoveButtons';
import { NewLessonDialog } from '~/instructor/content/NewLessonDialog';
import { useDeleteModule, useRenameModule } from '~/mutations/outline';
import { ApiFailure } from '~/services/ApiFailure';
import type { CourseModule } from '~/services/CourseService';

type Lesson = CourseModule['lessons'][number];

export class ModuleFacts {
  static of(module: CourseModule): string {
    if (module.lessons.length === 0) {
      return 'Nenhuma aula';
    }

    const minutes = module.lessons.reduce(
      (sum, lesson) => sum + lesson.durationMinutes,
      0,
    );

    return `${CourseFormat.count(module.lessons.length, 'aula', 'aulas')} · ${CourseFormat.duration(minutes)}`;
  }
}

export function ModuleCard({
  courseId,
  module,
  number,
  firstLessonNumber,
  first,
  last,
  editable,
  deletable,
  otherModules,
  onMove,
  onLessonsReorder,
  onMoveLesson,
  onMoveLessonTo,
  onDragEnd,
}: {
  courseId: string;
  module: CourseModule;
  number: number;
  firstLessonNumber: number;
  first: boolean;
  last: boolean;
  editable: boolean;
  deletable: boolean;
  otherModules: { id: string; title: string }[];
  onMove: (offset: -1 | 1) => void;
  onLessonsReorder: (lessons: Lesson[]) => void;
  onMoveLesson: (lessonId: string, offset: -1 | 1) => void;
  onMoveLessonTo: (lessonId: string, moduleId: string) => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const titleId = useId();
  const hintId = useId();
  const [renaming, setRenaming] = useState(false);
  const [adding, setAdding] = useState(false);
  const rename = useRenameModule(courseId, module.id);
  const remove = useDeleteModule(courseId, module.id);
  const hasLessons = module.lessons.length > 0;
  const what = `o módulo ${module.title}`;

  return (
    <Reorder.Item
      value={module}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      aria-labelledby={titleId}
      className="relative rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2.5 border-b px-4 py-3.5">
        {editable && (
          <DragHandle controls={controls} label="Arraste para mudar a ordem" />
        )}
        {renaming ? (
          <div className="min-w-0 flex-1">
            <ModuleTitleForm
              initial={module.title}
              submitLabel="Salvar"
              pendingLabel="Salvando…"
              onSave={async (title) => {
                await rename.mutateAsync(title);
                setRenaming(false);
              }}
              onCancel={() => {
                setRenaming(false);
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex min-w-0 flex-[1_1_15rem] flex-col">
              <span className="text-sm text-muted-foreground">
                Módulo {number}
              </span>
              <h3 id={titleId} className="text-lg leading-snug font-bold">
                {module.title}
              </h3>
            </div>
            <span className="text-muted-foreground">
              {ModuleFacts.of(module)}
            </span>
            {editable && (
              <div
                role="group"
                aria-label={`Ações do módulo ${module.title}`}
                className="flex gap-0.5"
              >
                <MoveButtons
                  what={what}
                  first={first}
                  last={last}
                  onMove={onMove}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Renomear ${what}`}
                  onClick={() => {
                    setRenaming(true);
                  }}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                {deletable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Apagar ${what}`}
                    aria-disabled={hasLessons || remove.isPending}
                    aria-describedby={hasLessons ? hintId : undefined}
                    className="text-destructive"
                    onClick={() => {
                      if (hasLessons || remove.isPending) {
                        return;
                      }

                      remove.mutate(undefined, {
                        onSuccess: () => {
                          toast.success('Módulo apagado.');
                        },
                        onError: (error) => {
                          toast.error(ApiFailure.message(error));
                        },
                      });
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
            {editable && deletable && hasLessons && (
              <span id={hintId} className="sr-only">
                Tire as aulas do módulo para apagá-lo.
              </span>
            )}
          </>
        )}
      </div>
      <Reorder.Group
        axis="y"
        values={module.lessons}
        onReorder={onLessonsReorder}
        className="flex flex-col py-1.5"
      >
        {module.lessons.map((lesson, index) => (
          <LessonRow
            key={lesson.id}
            courseId={courseId}
            moduleId={module.id}
            lesson={lesson}
            number={firstLessonNumber + index}
            first={index === 0}
            last={index === module.lessons.length - 1}
            editable={editable}
            deletable={deletable}
            otherModules={otherModules}
            onMove={(offset) => {
              onMoveLesson(lesson.id, offset);
            }}
            onMoveTo={(moduleId) => {
              onMoveLessonTo(lesson.id, moduleId);
            }}
            onDragEnd={onDragEnd}
          />
        ))}
      </Reorder.Group>
      {editable && (
        <div className="px-4 pt-1.5 pb-3.5">
          <Button
            variant="link"
            size="sm"
            className="px-3"
            onClick={() => {
              setAdding(true);
            }}
          >
            <Plus aria-hidden="true" />
            Nova aula
          </Button>
          <NewLessonDialog
            courseId={courseId}
            moduleId={module.id}
            moduleTitle={module.title}
            open={adding}
            onOpenChange={setAdding}
          />
        </div>
      )}
    </Reorder.Item>
  );
}
