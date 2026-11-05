import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { LeaveConfirmation } from '~/components/LeaveConfirmation';
import { Button } from '~/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { FormAlert } from '~/components/visitor/FormMessage';
import { useUnsavedChangesWarning } from '~/hooks/useUnsavedChangesWarning';
import {
  courseInfoSchema,
  type CourseInfoValues,
  DESCRIPTION_MAX,
} from '~/instructor/courseInfoSchema';
import { COURSE_ARCHIVED } from '~/instructor/instructorMessages';
import { cn } from '~/lib/utils';
import { ApiFailure } from '~/services/ApiFailure';

const EMPTY: CourseInfoValues = { title: '', description: '' };

// Read-only, not disabled: an archived course's text stays legible, selectable and reachable.
const READ_ONLY = 'border-border bg-muted text-muted-foreground';

export function CourseInfoForm({
  saved,
  readOnly = false,
  submitLabel,
  pendingLabel,
  onSave,
  actions,
}: {
  saved?: CourseInfoValues;
  readOnly?: boolean;
  submitLabel: string;
  pendingLabel: string;
  onSave: (info: CourseInfoValues) => Promise<unknown>;
  actions?: React.ReactNode;
}) {
  const id = useId();
  const form = useForm<CourseInfoValues>({
    resolver: zodResolver(courseInfoSchema),
    defaultValues: EMPTY,
    values: saved,
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  const description = useWatch({ control: form.control, name: 'description' });
  // Off while saving, so the navigation that follows a save is not held back, and once the course
  // is archived, since nothing typed can be saved any more.
  const unsaved = isDirty && !isSubmitting && !readOnly;

  useUnsavedChangesWarning(unsaved);

  const handleSubmit = form.handleSubmit(async (info) => {
    if (saved && !isDirty) {
      toast.message('Nenhuma alteração para salvar.');
      return;
    }

    try {
      await onSave(info);
      // The answer can equal the saved course (only spaces were trimmed), and then `values` does
      // not reset the form: reset it here, or it stays dirty.
      form.reset(info);
    } catch (error) {
      form.setError('root.server', {
        message: ApiFailure.message(error, { COURSE_ARCHIVED }),
      });
    }
  });

  return (
    <form
      onSubmit={(event) => {
        // The button stays focusable while saving, so Enter or a second click must not resend.
        if (form.formState.isSubmitting) {
          event.preventDefault();
          return;
        }

        void handleSubmit(event);
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <LeaveConfirmation when={unsaved} />
      <FieldGroup className="gap-5">
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-title`}>Título</FieldLabel>
              <Input
                {...field}
                id={`${id}-title`}
                readOnly={readOnly}
                aria-invalid={fieldState.invalid}
                aria-describedby={readOnly ? undefined : `${id}-title-hint`}
                className={cn('h-11 md:text-base', readOnly && READ_ONLY)}
              />
              {readOnly ? null : fieldState.invalid ? (
                <FieldError
                  id={`${id}-title-hint`}
                  errors={[fieldState.error]}
                />
              ) : (
                <FieldDescription id={`${id}-title-hint`}>
                  De 3 a 120 caracteres. Aparece no catálogo e na página do
                  curso.
                </FieldDescription>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-description`}>
                Descrição{' '}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </FieldLabel>
              <Textarea
                {...field}
                id={`${id}-description`}
                readOnly={readOnly}
                rows={7}
                maxLength={DESCRIPTION_MAX}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  readOnly ? undefined : `${id}-description-count`
                }
                className={cn(
                  'min-h-42 md:text-base',
                  readOnly && `${READ_ONLY} resize-none`,
                )}
              />
              <FieldError errors={[fieldState.error]} />
              {!readOnly && (
                <span
                  id={`${id}-description-count`}
                  className="text-right text-sm text-muted-foreground"
                >
                  {description.length} de {DESCRIPTION_MAX}
                </span>
              )}
            </Field>
          )}
        />
      </FieldGroup>
      {/* Beside the button, so a phone that sent the form from the bottom sees the answer. */}
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      {!readOnly && (
        <div className="flex flex-wrap justify-end gap-3">
          {actions}
          {/* Not disabled while saving: a disabled button drops the keyboard focus to the page. */}
          <Button
            type="submit"
            aria-disabled={isSubmitting}
            className="aria-disabled:cursor-progress aria-disabled:opacity-50"
          >
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
