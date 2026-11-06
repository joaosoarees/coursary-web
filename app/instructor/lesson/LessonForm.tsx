import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { LeaveConfirmation } from '~/components/LeaveConfirmation';
import { LessonBody } from '~/components/lesson/LessonBody';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { FormAlert } from '~/components/visitor/FormMessage';
import { useUnsavedChangesWarning } from '~/hooks/useUnsavedChangesWarning';
import { COURSE_ARCHIVED } from '~/instructor/instructorMessages';
import {
  BODY_MAX_BYTES,
  bodyBytes,
  lessonSchema,
  type LessonValues,
} from '~/instructor/lesson/lessonSchema';
import { cn } from '~/lib/utils';
import { useUpdateLesson } from '~/mutations/outline';
import { ApiFailure } from '~/services/ApiFailure';

const KIB = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const READ_ONLY = 'border-border bg-muted text-muted-foreground';

// Rounded up, so a text just over the limit never reads as 32,0.
const kib = (bytes: number) => KIB.format(Math.ceil((bytes / 1024) * 10) / 10);

const NEAR_LIMIT = 0.9 * BODY_MAX_BYTES;

const TAB =
  'h-9 px-3.5 text-base data-[state=active]:bg-card dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-card';

export function LessonForm({
  courseId,
  moduleId,
  lessonId,
  saved,
  readOnly,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
  saved: LessonValues;
  readOnly: boolean;
}) {
  const id = useId();
  const update = useUpdateLesson(courseId, moduleId, lessonId);
  const form = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema),
    values: saved,
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  const body = useWatch({ control: form.control, name: 'body' });
  const unsaved = isDirty && !isSubmitting && !readOnly;
  const [tab, setTab] = useState('escrever');
  const formRef = useRef<HTMLFormElement>(null);

  // Ctrl+S (Cmd+S) saves from anywhere in the form instead of saving the browser's page.
  useEffect(() => {
    const element = formRef.current;

    if (!element || readOnly) {
      return;
    }

    const saveOnShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        element.requestSubmit();
      }
    };

    element.addEventListener('keydown', saveOnShortcut);

    return () => {
      element.removeEventListener('keydown', saveOnShortcut);
    };
  }, [readOnly]);
  const bytes = bodyBytes(body);
  const limit =
    bytes > BODY_MAX_BYTES ? 'over' : bytes >= NEAR_LIMIT ? 'near' : 'under';

  useUnsavedChangesWarning(unsaved);

  const handleSubmit = form.handleSubmit(
    async (lesson) => {
      if (!isDirty) {
        toast.message('Nenhuma alteração para salvar.');
        return;
      }

      try {
        await update.mutateAsync(lesson);
        form.reset(lesson);
        toast.success('Aula salva.');
      } catch (error) {
        form.setError('root.server', {
          message: ApiFailure.message(error, { COURSE_ARCHIVED }),
        });
      }
    },
    (invalid) => {
      // A text over the limit can be refused from the preview, where the field is not mounted.
      if (invalid.body && !invalid.title && !invalid.durationMinutes) {
        setTab('escrever');
        requestAnimationFrame(() => {
          form.setFocus('body');
        });
      }
    },
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        if (form.formState.isSubmitting) {
          event.preventDefault();
          return;
        }

        void handleSubmit(event);
      }}
      aria-labelledby={`${id}-heading`}
      className="flex flex-col gap-5 rounded-lg border bg-card p-5 text-card-foreground shadow-sm md:p-7"
    >
      <LeaveConfirmation when={unsaved} />
      <h2 id={`${id}-heading`} className="font-display text-xl font-bold">
        Aula
      </h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-0 flex-[1_1_18rem] flex-col gap-2">
          <label htmlFor={`${id}-title`} className="font-bold">
            Título
          </label>
          <Input
            id={`${id}-title`}
            readOnly={readOnly}
            aria-invalid={errors.title !== undefined}
            aria-describedby={errors.title ? `${id}-title-error` : undefined}
            className={cn('md:text-base', readOnly && READ_ONLY)}
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
              readOnly={readOnly}
              aria-invalid={errors.durationMinutes !== undefined}
              aria-describedby={
                errors.durationMinutes
                  ? `${id}-duration-unit ${id}-duration-error`
                  : `${id}-duration-unit`
              }
              className={cn('w-24 md:text-base', readOnly && READ_ONLY)}
              {...form.register('durationMinutes', { valueAsNumber: true })}
            />
            <span id={`${id}-duration-unit`} className="text-muted-foreground">
              minutos
            </span>
          </div>
          {errors.durationMinutes && (
            <p
              id={`${id}-duration-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.durationMinutes.message}
            </p>
          )}
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <span id={`${id}-body-label`} className="font-bold">
            Texto da aula{' '}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </span>
          <TabsList
            variant="default"
            aria-labelledby={`${id}-body-label`}
            className="h-auto rounded-md bg-muted"
          >
            <TabsTrigger value="escrever" className={TAB}>
              Escrever
            </TabsTrigger>
            <TabsTrigger value="previa" className={TAB}>
              Prévia
            </TabsTrigger>
          </TabsList>
        </div>
        {/* The field is the stop; the panel around it would be an empty one. */}
        <TabsContent value="escrever" tabIndex={-1}>
          <Textarea
            aria-labelledby={`${id}-body-label`}
            aria-describedby={
              readOnly
                ? undefined
                : [
                    `${id}-body-hint`,
                    `${id}-body-count`,
                    errors.body ? `${id}-body-error` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
            }
            aria-invalid={errors.body !== undefined}
            readOnly={readOnly}
            rows={14}
            className={cn(
              'max-h-[70vh] min-h-80 overflow-y-auto leading-relaxed md:text-base',
              readOnly && `${READ_ONLY} resize-none`,
            )}
            {...form.register('body')}
          />
        </TabsContent>
        <TabsContent
          value="previa"
          className="min-h-80 rounded-md border bg-background px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {body.trim() === '' ? (
            <p className="text-muted-foreground">
              Nada escrito ainda. O que entrar em Escrever aparece aqui como o
              aluno vê.
            </p>
          ) : (
            <LessonBody markdown={body} />
          )}
        </TabsContent>
        {!readOnly && (
          <div className="flex flex-wrap justify-between gap-3 text-sm text-muted-foreground">
            <span id={`${id}-body-hint`}>
              Markdown: ## títulos, **negrito**, listas, links e blocos de
              código. Ctrl+S salva.
            </span>
            <span
              id={`${id}-body-count`}
              className={cn(limit !== 'under' && 'font-bold text-destructive')}
            >
              {kib(bytes)} de {String(BODY_MAX_BYTES / 1024)} KiB
            </span>
          </div>
        )}
        {/* Said once at each threshold, not on every key. */}
        <p role="status" className="sr-only">
          {limit === 'over'
            ? 'O texto passou do limite de 32 KiB.'
            : limit === 'near'
              ? 'O texto está perto do limite de 32 KiB.'
              : ''}
        </p>
        {errors.body && (
          <p
            id={`${id}-body-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.body.message}
          </p>
        )}
      </Tabs>
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      {!readOnly && (
        <div className="mt-auto flex justify-end">
          {/* Not disabled while saving: a disabled button drops the keyboard focus to the page. */}
          <Button
            type="submit"
            aria-disabled={isSubmitting}
            className="aria-disabled:cursor-progress"
          >
            {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      )}
    </form>
  );
}
