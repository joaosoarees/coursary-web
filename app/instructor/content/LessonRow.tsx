import { Ellipsis } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { ConfirmDialog } from '~/components/ConfirmDialog';
import { CourseFormat } from '~/components/course/CourseFormat';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { focusLater, focusMark } from '~/instructor/content/contentFocus';
import { DragHandle } from '~/instructor/content/DragHandle';
import { MoveButtons } from '~/instructor/content/MoveButtons';
import { useDeleteLesson } from '~/mutations/outline';
import { ApiFailure } from '~/services/ApiFailure';
import type { CourseModule } from '~/services/CourseService';

type Lesson = CourseModule['lessons'][number];

export function LessonRow({
  courseId,
  moduleId,
  lesson,
  number,
  first,
  last,
  editable,
  deletable,
  otherModules,
  onMove,
  onMoveTo,
  onDragEnd,
}: {
  courseId: string;
  moduleId: string;
  lesson: Lesson;
  number: number;
  first: boolean;
  last: boolean;
  editable: boolean;
  deletable: boolean;
  otherModules: { id: string; title: string }[];
  onMove: (offset: -1 | 1) => void;
  onMoveTo: (moduleId: string) => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const moveLabelId = useId();
  const [deleting, setDeleting] = useState(false);
  const remove = useDeleteLesson(courseId, moduleId);
  const what = `a aula ${lesson.title}`;
  const hasMenu = otherModules.length > 0 || deletable;

  return (
    // Not a tab stop: the row itself does nothing, and its controls are reached one by one.
    <Reorder.Item
      value={lesson}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      tabIndex={-1}
      className="relative flex min-h-13 flex-wrap items-center gap-x-2.5 bg-card px-4 py-1 sm:flex-nowrap"
    >
      {editable && (
        <DragHandle controls={controls} label="Arraste para mudar a ordem" />
      )}
      <span className="w-7 shrink-0 text-right text-muted-foreground">
        {number}
      </span>
      <Link
        to={`/instrutor/cursos/${courseId}/aulas/${lesson.id}`}
        className="min-w-0 flex-1 py-2 font-semibold break-words hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:truncate sm:py-0"
      >
        {lesson.title}
      </Link>
      {/* On a phone the duration and the controls take a second line, so the title can be read. */}
      <div
        className={`flex w-full items-center justify-between sm:contents ${editable ? 'pl-17' : 'pl-9.5'}`}
      >
        <span className="shrink-0 text-muted-foreground">
          {CourseFormat.duration(lesson.durationMinutes)}
        </span>
        {editable && (
          <div
            role="group"
            aria-label={`Ações da aula ${lesson.title}`}
            className="flex gap-1"
          >
            <MoveButtons
              what={what}
              first={first}
              last={last}
              onMove={onMove}
            />
            {hasMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Mais ações da aula ${lesson.title}`}
                    {...focusMark(`lesson-menu-${lesson.id}`)}
                  >
                    <Ellipsis aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64"
                  onCloseAutoFocus={(event) => {
                    // A moved row remounts in its new module; the focus follows it there.
                    event.preventDefault();
                    focusLater(`lesson-menu-${lesson.id}`);
                  }}
                >
                  {otherModules.length > 0 && (
                    <DropdownMenuGroup aria-labelledby={moveLabelId}>
                      <DropdownMenuLabel
                        id={moveLabelId}
                        className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
                      >
                        Mover para o fim de
                      </DropdownMenuLabel>
                      {otherModules.map((module) => (
                        <DropdownMenuItem
                          key={module.id}
                          onSelect={() => {
                            onMoveTo(module.id);
                          }}
                        >
                          {module.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  )}
                  {deletable && (
                    <>
                      {otherModules.length > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          setDeleting(true);
                        }}
                      >
                        Apagar a aula
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleting}
        onClose={() => {
          setDeleting(false);
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          focusLater(
            remove.isSuccess
              ? `module-add-${moduleId}`
              : `lesson-menu-${lesson.id}`,
          );
        }}
        pending={remove.isPending}
        error={remove.error && ApiFailure.message(remove.error)}
        onReset={remove.reset}
        title="Apagar a aula?"
        description={
          <>
            A aula <strong className="text-foreground">{lesson.title}</strong>{' '}
            será apagada com o texto, o material e o vídeo. Isso não pode ser
            desfeito.
          </>
        }
        confirm={{
          label: 'Apagar a aula',
          pending: 'Apagando…',
          destructive: true,
        }}
        onConfirm={() => {
          remove.mutate(lesson.id, {
            onSuccess: () => {
              setDeleting(false);
              toast.success('Aula apagada.');
              focusLater(`module-add-${moduleId}`);
            },
          });
        }}
      />
    </Reorder.Item>
  );
}
