import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { FormAlert } from '~/components/visitor/FormMessage';
import {
  newLessonSchema,
  type NewLessonValues,
} from '~/instructor/content/contentSchemas';
import { useCreateLesson } from '~/mutations/outline';
import { ApiFailure } from '~/services/ApiFailure';

export function NewLessonDialog({
  courseId,
  moduleId,
  moduleTitle,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[32rem]"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {open && (
          <NewLessonForm
            courseId={courseId}
            moduleId={moduleId}
            moduleTitle={moduleTitle}
            onDone={() => {
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewLessonForm({
  courseId,
  moduleId,
  moduleTitle,
  onDone,
}: {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  onDone: () => void;
}) {
  const id = useId();
  const create = useCreateLesson(courseId, moduleId);
  const form = useForm<NewLessonValues>({
    resolver: zodResolver(newLessonSchema),
    defaultValues: { title: '', durationMinutes: 10 },
  });
  const { errors, isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async (lesson) => {
    try {
      await create.mutateAsync(lesson);
      toast.success('Aula criada.');
      onDone();
    } catch (error) {
      form.setError('root.server', { message: ApiFailure.message(error) });
    }
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        if (form.formState.isSubmitting) {
          event.preventDefault();
          return;
        }

        void handleSubmit(event);
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-2 text-left">
        <DialogTitle>Nova aula</DialogTitle>
        <DialogDescription className="text-base">
          No módulo <strong className="text-foreground">{moduleTitle}</strong>.
          O texto, o material e o vídeo entram depois, no editor da aula.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-title`} className="font-bold">
          Título
        </label>
        <Input
          id={`${id}-title`}
          aria-invalid={errors.title !== undefined}
          aria-describedby={errors.title ? `${id}-title-error` : undefined}
          className="md:text-base"
          {...form.register('title')}
        />
        {errors.title && (
          <p
            id={`${id}-title-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.title.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-duration`} className="font-bold">
          Duração
        </label>
        <div className="flex items-center gap-2.5">
          <Input
            id={`${id}-duration`}
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            aria-invalid={errors.durationMinutes !== undefined}
            aria-describedby={`${id}-duration-hint`}
            className="w-28 md:text-base"
            {...form.register('durationMinutes', { valueAsNumber: true })}
          />
          <span className="text-muted-foreground">minutos</span>
        </div>
        <p
          id={`${id}-duration-hint`}
          className={
            errors.durationMinutes
              ? 'text-sm text-destructive'
              : 'text-sm text-muted-foreground'
          }
          role={errors.durationMinutes ? 'alert' : undefined}
        >
          {errors.durationMinutes?.message ??
            'De 1 a 600. Aparece na grade do curso.'}
        </p>
      </div>
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button
          type="submit"
          aria-disabled={isSubmitting}
          className="aria-disabled:cursor-progress"
        >
          {isSubmitting ? 'Criando…' : 'Criar aula'}
        </Button>
      </DialogFooter>
    </form>
  );
}
