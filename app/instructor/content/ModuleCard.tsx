import { Ellipsis, Plus } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { useId, useState } from 'react';
import { toast } from 'sonner';

import { CourseFormat } from '~/components/course/CourseFormat';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { focusLater, focusMark } from '~/instructor/content/contentFocus';
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
      tabIndex={-1}
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
                focusLater(`module-menu-${module.id}`);
              }}
              onCancel={() => {
                setRenaming(false);
                focusLater(`module-menu-${module.id}`);
              }}
            />
          </div>
        ) : (
          <>
            <h3
              id={titleId}
              className="min-w-0 flex-[1_1_15rem] text-lg leading-snug font-bold"
            >
              <span className="font-normal text-muted-foreground">
                Módulo {number} ·{' '}
              </span>
              {module.title}
            </h3>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Mais ações do módulo ${module.title}`}
                      {...focusMark(`module-menu-${module.id}`)}
                    >
                      <Ellipsis aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem
                      onSelect={() => {
                        setRenaming(true);
                      }}
                    >
                      Renomear o módulo
                    </DropdownMenuItem>
                    {deletable && (
                      <>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={hasLessons || remove.isPending}
                          aria-describedby={hasLessons ? hintId : undefined}
                          onSelect={() => {
                            remove.mutate(undefined, {
                              onSuccess: () => {
                                toast.success('Módulo apagado.');
                                focusLater('content-new-module');
                              },
                              onError: (error) => {
                                toast.error(ApiFailure.message(error));
                              },
                            });
                          }}
                        >
                          Apagar o módulo
                        </DropdownMenuItem>
                        {/* Outside the item: a disabled item is drawn at half opacity. */}
                        {hasLessons && (
                          <p
                            id={hintId}
                            className="px-2 pb-1.5 text-xs text-muted-foreground"
                          >
                            Tire as aulas do módulo para apagá-lo.
                          </p>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            {...focusMark(`module-add-${module.id}`)}
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
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              focusLater(`module-add-${module.id}`);
            }}
          />
        </div>
      )}
    </Reorder.Item>
  );
}
