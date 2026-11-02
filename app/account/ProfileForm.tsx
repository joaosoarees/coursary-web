import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { profileSchema, type ProfileValues } from '~/account/profileSchema';
import { Button } from '~/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { FormAlert } from '~/components/visitor/FormMessage';
import { useUpdateMe } from '~/mutations/account';
import type { Profile } from '~/services/AccountService';
import { ApiFailure } from '~/services/ApiFailure';

const ROLE_LABELS: Record<Profile['role'], string> = {
  student: 'Aluno',
  instructor: 'Instrutor',
  admin: 'Administrador',
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const id = useId();
  const updateMe = useUpdateMe();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name },
  });
  const { errors, isSubmitting, isDirty } = form.formState;

  const handleSubmit = form.handleSubmit(async ({ name }) => {
    try {
      const saved = await updateMe.mutateAsync(name);
      form.reset({ name: saved.name });
      toast.success('Nome salvo.');
    } catch (error) {
      form.setError('root.server', { message: ApiFailure.message(error) });
    }
  });

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
    >
      <h2 id={`${id}-title`} className="font-display text-xl font-bold">
        Dados
      </h2>
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <FieldGroup className="gap-5">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-name`}>Nome</FieldLabel>
                <Input
                  {...field}
                  id={`${id}-name`}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-name-error` : undefined
                  }
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${id}-name-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="font-bold">E-mail</dt>
              <dd className="break-all text-muted-foreground">
                {profile.email}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-bold">Papel</dt>
              <dd className="text-muted-foreground">
                {ROLE_LABELS[profile.role]}
              </dd>
            </div>
          </dl>
          <Button
            type="submit"
            className="self-start"
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </FieldGroup>
      </form>
    </section>
  );
}
