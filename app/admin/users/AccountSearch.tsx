import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { emailSchema } from '~/auth/authSchemas';
import { Button } from '~/components/ui/button';
import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

const searchSchema = z.object({ email: emailSchema });

type SearchValues = z.infer<typeof searchSchema>;

export function AccountSearch({
  takeFocus,
  onSearch,
}: {
  takeFocus: boolean;
  onSearch: (email: string) => void;
}) {
  const id = useId();
  const form = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { email: '' },
  });
  const { setFocus } = form;

  useEffect(() => {
    if (takeFocus) {
      setFocus('email');
    }
  }, [takeFocus, setFocus]);

  return (
    <form
      role="search"
      noValidate
      className="flex max-w-110 flex-[1_1_22rem] flex-col"
      onSubmit={(event) =>
        void form.handleSubmit(({ email }) => {
          onSearch(email);
        })(event)
      }
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1.5">
            <FieldLabel htmlFor={`${id}-email`} className="font-bold">
              Buscar por e-mail
            </FieldLabel>
            <span className="flex gap-2">
              <Input
                {...field}
                id={`${id}-email`}
                type="email"
                placeholder="nome@exemplo.com"
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? `${id}-email-error` : undefined
                }
              />
              <Button type="submit" variant="outline">
                Buscar
              </Button>
            </span>
            {fieldState.invalid && (
              <FieldError
                id={`${id}-email-error`}
                errors={[fieldState.error]}
              />
            )}
          </Field>
        )}
      />
    </form>
  );
}
