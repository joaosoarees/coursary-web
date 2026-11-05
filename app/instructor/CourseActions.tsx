import { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { CourseFormat } from '~/components/course/CourseFormat';
import { DISCARDING } from '~/components/LeaveConfirmation';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { FormAlert } from '~/components/visitor/FormMessage';
import { COURSE_ARCHIVED } from '~/instructor/instructorMessages';
import {
  useArchiveCourse,
  useDeleteDraft,
  usePublishCourse,
} from '~/mutations/instructor';
import { ApiFailure } from '~/services/ApiFailure';
import type { ManagedCourse } from '~/services/InstructorService';

const NEEDS_A_LESSON = 'Adicione ao menos uma aula para publicar.';

type Action = 'publish' | 'archive' | 'delete';

export function CourseActions({
  course,
  heading,
  unsaved,
}: {
  course: ManagedCourse;
  heading: React.RefObject<HTMLHeadingElement | null>;
  unsaved: boolean;
}) {
  const hintId = useId();
  const [asking, setAsking] = useState<Action>();
  const opener = useRef<HTMLElement>(null);
  // Publishing or archiving now would leave the unsaved edits behind; archiving, for good.
  const blockedBy =
    course.status === 'DRAFT' && course.lessonCount === 0
      ? NEEDS_A_LESSON
      : unsaved && course.status === 'DRAFT'
        ? 'Salve as alterações antes de publicar.'
        : unsaved && course.status === 'PUBLISHED'
          ? 'Salve as alterações antes de arquivar.'
          : undefined;
  const ask = (action: Action, from: HTMLElement) => {
    opener.current = from;
    setAsking(action);
  };
  const close = () => {
    setAsking(undefined);
  };
  // The dialogs open from state, not from a trigger, so Radix has nowhere to send the focus back;
  // and after a publish or an archive the button that opened it is gone.
  const returnFocus = (event: Event) => {
    event.preventDefault();
    (opener.current?.isConnected ? opener.current : heading.current)?.focus();
  };

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <div className="flex flex-wrap gap-3">
        {course.status === 'DRAFT' && (
          <>
            <Button
              variant="destructive-outline"
              onClick={(event) => {
                ask('delete', event.currentTarget);
              }}
            >
              Apagar rascunho
            </Button>
            {/* aria-disabled, not disabled: it stays in the tab order, so its reason is heard. */}
            <Button
              aria-disabled={blockedBy !== undefined}
              aria-describedby={blockedBy ? hintId : undefined}
              onClick={(event) => {
                if (!blockedBy) {
                  ask('publish', event.currentTarget);
                }
              }}
            >
              Publicar
            </Button>
          </>
        )}
        {course.status !== 'DRAFT' && (
          <Button variant="outline" asChild>
            <Link to={`/cursos/${course.id}`}>Ver a página do curso</Link>
          </Button>
        )}
        {course.status === 'PUBLISHED' && (
          <Button
            variant="destructive-outline"
            aria-disabled={blockedBy !== undefined}
            aria-describedby={blockedBy ? hintId : undefined}
            onClick={(event) => {
              if (!blockedBy) {
                ask('archive', event.currentTarget);
              }
            }}
          >
            Arquivar
          </Button>
        )}
      </div>
      {blockedBy && (
        <p id={hintId} className="text-muted-foreground">
          {blockedBy}
        </p>
      )}
      <PublishDialog
        course={course}
        open={asking === 'publish'}
        onClose={close}
        onCloseAutoFocus={returnFocus}
      />
      <ArchiveDialog
        course={course}
        open={asking === 'archive'}
        onClose={close}
        onCloseAutoFocus={returnFocus}
      />
      <DeleteDialog
        course={course}
        open={asking === 'delete'}
        onClose={close}
        onCloseAutoFocus={returnFocus}
      />
    </div>
  );
}

interface DialogProps {
  course: ManagedCourse;
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
}

function PublishDialog({
  course,
  open,
  onClose,
  onCloseAutoFocus,
}: DialogProps) {
  const publish = usePublishCourse(course.id);

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
      pending={publish.isPending}
      error={
        publish.error &&
        ApiFailure.message(publish.error, {
          COURSE_EMPTY: NEEDS_A_LESSON,
          COURSE_ARCHIVED,
        })
      }
      onReset={publish.reset}
      title="Publicar o curso?"
      description={
        <>
          Depois de publicado,{' '}
          <strong className="text-foreground">{course.title}</strong> aparece no
          catálogo e qualquer pessoa pode se matricular.
        </>
      }
      consequence="Ele não volta a ser rascunho: para tirá-lo do catálogo, você arquiva."
      confirm={{ label: 'Publicar', pending: 'Publicando…' }}
      onConfirm={() => {
        publish.mutate(undefined, {
          onSuccess: () => {
            onClose();
            toast.success('Curso publicado.');
          },
        });
      }}
    />
  );
}

function ArchiveDialog({
  course,
  open,
  onClose,
  onCloseAutoFocus,
}: DialogProps) {
  const archive = useArchiveCourse(course.id);
  const students =
    course.enrollmentCount === 1
      ? 'O aluno matriculado continua com acesso e recebe'
      : `Os ${CourseFormat.count(course.enrollmentCount, 'aluno', 'alunos')} matriculados continuam com acesso e recebem`;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
      pending={archive.isPending}
      error={
        archive.error &&
        ApiFailure.message(archive.error, {
          COURSE_NOT_PUBLISHED: 'Só um curso publicado pode ser arquivado.',
          COURSE_ARCHIVED: 'O curso já foi arquivado.',
        })
      }
      onReset={archive.reset}
      title="Arquivar o curso?"
      description={
        <>
          O curso <strong className="text-foreground">{course.title}</strong>{' '}
          sai do catálogo e da busca.{' '}
          {course.enrollmentCount === 0
            ? 'Ninguém está matriculado agora.'
            : `${students} um aviso por e-mail.`}
        </>
      }
      consequence="Arquivar não tem volta: o curso não pode mais ser editado nem publicado de novo."
      confirm={{
        label: 'Arquivar o curso',
        pending: 'Arquivando…',
        destructive: true,
      }}
      onConfirm={() => {
        archive.mutate(undefined, {
          onSuccess: () => {
            onClose();
            toast.success('Curso arquivado.');
          },
        });
      }}
    />
  );
}

function DeleteDialog({
  course,
  open,
  onClose,
  onCloseAutoFocus,
}: DialogProps) {
  const remove = useDeleteDraft(course.id);
  const navigate = useNavigate();

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
      pending={remove.isPending}
      error={
        remove.error &&
        ApiFailure.message(remove.error, {
          COURSE_NOT_DRAFT: 'Só um rascunho pode ser apagado.',
        })
      }
      onReset={remove.reset}
      title="Apagar o rascunho?"
      description={
        <>
          O rascunho <strong className="text-foreground">{course.title}</strong>{' '}
          será apagado{DraftContents.of(course)}. Isso não pode ser desfeito.
        </>
      }
      confirm={{
        label: 'Apagar rascunho',
        pending: 'Apagando…',
        destructive: true,
      }}
      onConfirm={() => {
        remove.mutate(undefined, {
          onSuccess: () => {
            toast.success('Rascunho apagado.');
            void navigate('/instrutor/cursos', {
              replace: true,
              state: DISCARDING,
            });
          },
        });
      }}
    />
  );
}

class DraftContents {
  // " com a capa e as 12 aulas", " com a aula", or nothing for an empty draft.
  static of(course: ManagedCourse): string {
    const parts = [
      course.coverUrl ? 'a capa' : undefined,
      course.lessonCount === 0
        ? undefined
        : course.lessonCount === 1
          ? 'a aula'
          : `as ${CourseFormat.count(course.lessonCount, 'aula', 'aulas')}`,
    ].filter((part) => part !== undefined);

    return parts.length === 0 ? '' : ` com ${parts.join(' e ')}`;
  }
}

function ConfirmDialog({
  open,
  onClose,
  onCloseAutoFocus,
  consequence,
  pending,
  error,
  onReset,
  title,
  description,
  confirm,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
  consequence?: string;
  pending: boolean;
  error: string | null;
  onReset: () => void;
  title: string;
  description: React.ReactNode;
  confirm: { label: string; pending: string; destructive?: boolean };
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) {
          return;
        }

        if (!next) {
          onClose();
          onReset();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[32rem]"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader className="gap-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-4 text-base">
              <p>{description}</p>
              {consequence && <p>{consequence}</p>}
            </div>
          </DialogDescription>
        </DialogHeader>
        {error && <FormAlert>{error}</FormAlert>}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              onClose();
              onReset();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant={confirm.destructive ? 'destructive' : 'default'}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? confirm.pending : confirm.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
