import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { FormAlert } from '~/components/visitor/FormMessage';
import {
  moduleTitleSchema,
  type ModuleTitleValues,
} from '~/instructor/content/contentSchemas';
import { ApiFailure } from '~/services/ApiFailure';

// Creating a module and renaming one ask for the same title, in place.
export function ModuleTitleForm({
  initial = '',
  submitLabel,
  pendingLabel,
  onSave,
  onCancel,
}: {
  initial?: string;
  submitLabel: string;
  pendingLabel: string;
  onSave: (title: string) => Promise<unknown>;
  onCancel: () => void;
}) {
  const id = useId();
  const form = useForm<ModuleTitleValues>({
    resolver: zodResolver(moduleTitleSchema),
    defaultValues: { title: initial },
  });
  const { errors, isSubmitting } = form.formState;

  // The field appears where the person asked for it, so the typing starts there.
  useEffect(() => {
    form.setFocus('title');
  }, [form]);

  const handleSubmit = form.handleSubmit(async ({ title }) => {
    try {
      await onSave(title);
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
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-2">
          <label htmlFor={`${id}-title`} className="font-bold">
            Título do módulo
          </label>
          <Input
            id={`${id}-title`}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                onCancel();
              }
            }}
            aria-invalid={errors.title !== undefined}
            aria-describedby={errors.title ? `${id}-error` : undefined}
            className="md:text-base"
            {...form.register('title')}
          />
        </div>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          aria-disabled={isSubmitting}
          className="aria-disabled:cursor-progress"
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </div>
      {errors.title && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {errors.title.message}
        </p>
      )}
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
    </form>
  );
}
