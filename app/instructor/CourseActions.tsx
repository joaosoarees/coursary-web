import { useId, useState } from 'react';
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

export function CourseActions({ course }: { course: ManagedCourse }) {
  const hintId = useId();
  const [asking, setAsking] = useState<Action>();
  const empty = course.lessonCount === 0;

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <div className="flex flex-wrap gap-3">
        {course.status === 'DRAFT' && (
          <>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setAsking('delete');
              }}
            >
              Apagar rascunho
            </Button>
            <Button
              disabled={empty}
              aria-describedby={empty ? hintId : undefined}
              onClick={() => {
                setAsking('publish');
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
            variant="outline"
            onClick={() => {
              setAsking('archive');
            }}
          >
            Arquivar
          </Button>
        )}
      </div>
      {course.status === 'DRAFT' && empty && (
        <p id={hintId} className="text-muted-foreground">
          {NEEDS_A_LESSON}
        </p>
      )}
      <PublishDialog
        course={course}
        open={asking === 'publish'}
        onClose={() => {
          setAsking(undefined);
        }}
      />
      <ArchiveDialog
        course={course}
        open={asking === 'archive'}
        onClose={() => {
          setAsking(undefined);
        }}
      />
      <DeleteDialog
        course={course}
        open={asking === 'delete'}
        onClose={() => {
          setAsking(undefined);
        }}
      />
    </div>
  );
}

interface DialogProps {
  course: ManagedCourse;
  open: boolean;
  onClose: () => void;
}

function PublishDialog({ course, open, onClose }: DialogProps) {
  const publish = usePublishCourse(course.id);

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
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
          catálogo e qualquer pessoa pode se matricular. Ele não volta a ser
          rascunho: para tirá-lo do catálogo, você arquiva.
        </>
      }
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

function ArchiveDialog({ course, open, onClose }: DialogProps) {
  const archive = useArchiveCourse(course.id);
  const students =
    course.enrollmentCount === 1
      ? 'O aluno matriculado continua com acesso e recebe'
      : `Os ${CourseFormat.count(course.enrollmentCount, 'aluno', 'alunos')} matriculados continuam com acesso e recebem`;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
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
          <strong className="text-foreground">{course.title}</strong> sai do
          catálogo e da busca.{' '}
          {course.enrollmentCount === 0
            ? 'Ninguém está matriculado agora.'
            : `${students} um aviso por e-mail.`}{' '}
          Arquivar não tem volta: o curso não pode mais ser editado nem
          publicado de novo.
        </>
      }
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

function DeleteDialog({ course, open, onClose }: DialogProps) {
  const remove = useDeleteDraft(course.id);
  const navigate = useNavigate();

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
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
          será apagado com a capa e tudo o que estiver nele. Isso não pode ser
          desfeito.
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

function ConfirmDialog({
  open,
  onClose,
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
      <DialogContent showCloseButton={false} className="sm:max-w-[32rem]">
        <DialogHeader className="gap-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
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
