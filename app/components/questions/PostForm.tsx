import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { QuestionFailure } from '~/components/questions/QuestionFailure';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { FormAlert } from '~/components/visitor/FormMessage';
import { cn } from '~/lib/utils';

export const MAX_POST = 2000;
const WARN_AT = 1800;

const postSchema = z.object({
  text: z.string().trim().min(1).max(MAX_POST),
});

type PostValues = z.input<typeof postSchema>;

const COUNT = new Intl.NumberFormat('pt-BR', { useGrouping: 'always' });

export function PostForm({
  label,
  placeholder,
  hint,
  emptyMessage,
  submit,
  rows,
  className,
  onPost,
}: {
  label: string;
  placeholder: string;
  hint?: React.ReactNode;
  emptyMessage: string;
  submit: { label: string; pending: string; size?: 'default' | 'sm' };
  rows: number;
  className?: string;
  onPost: (text: string) => Promise<unknown>;
}) {
  const id = useId();
  const form = useForm<PostValues, unknown, z.output<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { text: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const length = useWatch({ control: form.control, name: 'text' }).length;
  const fieldError = errors.text ? emptyMessage : undefined;
  const describedBy = [
    fieldError ? `${id}-error` : undefined,
    `${id}-hint`,
  ].filter(Boolean);

  const post = async (text: string, formElement: HTMLFormElement) => {
    try {
      await onPost(text);
      form.reset();
      formElement.querySelector('textarea')?.focus();
    } catch (error) {
      // An out-of-date screen is reloaded and this form may go with it: the toast outlives it.
      if (QuestionFailure.isStale(error)) {
        toast.error(QuestionFailure.message(error));
        return;
      }

      form.setError('root.server', {
        message: QuestionFailure.message(error),
      });
    }
  };

  return (
    <form
      noValidate
      className={cn('flex flex-col gap-2.5', className)}
      onSubmit={(event) => {
        if (form.formState.isSubmitting) {
          event.preventDefault();
          return;
        }

        const formElement = event.currentTarget;

        void form.handleSubmit(({ text }) => post(text, formElement))(event);
      }}
    >
      <label htmlFor={`${id}-text`} className="font-bold">
        {label}
      </label>
      <Textarea
        id={`${id}-text`}
        rows={rows}
        maxLength={MAX_POST}
        placeholder={placeholder}
        readOnly={isSubmitting}
        aria-invalid={fieldError !== undefined}
        aria-describedby={describedBy.join(' ')}
        className="field-sizing-fixed resize-y bg-card md:text-base dark:bg-input/30"
        {...form.register('text')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      {fieldError && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {fieldError}
        </p>
      )}
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
          {hint && ' '}
          <span className="whitespace-nowrap">Ctrl+Enter envia.</span>
        </p>
        <div className="ml-auto flex items-center gap-3.5">
          {length >= WARN_AT && (
            <span className="text-sm text-muted-foreground">
              {COUNT.format(length)} de {COUNT.format(MAX_POST)}
            </span>
          )}
          <Button type="submit" size={submit.size} disabled={isSubmitting}>
            {isSubmitting ? submit.pending : submit.label}
          </Button>
        </div>
      </div>
    </form>
  );
}
