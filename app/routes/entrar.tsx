import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router';

import { TOO_MANY_REQUESTS } from '~/auth/authMessages';
import { signInSchema, type SignInValues } from '~/auth/authSchemas';
import { LocationState } from '~/auth/LocationState';
import { useAuth } from '~/auth/useAuth';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { FormAlert } from '~/components/visitor/FormMessage';
import { PasswordInput } from '~/components/visitor/PasswordInput';
import { SubmitButton } from '~/components/visitor/SubmitButton';
import { VisitorCard } from '~/components/visitor/VisitorCard';
import { ApiFailure } from '~/services/ApiFailure';

import type { Route } from './+types/entrar';

export const meta: Route.MetaFunction = () => [{ title: 'Entrar · Coursary' }];

export default function SignIn() {
  const id = useId();
  const location = useLocation();
  const { signIn } = useAuth();
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: LocationState.email(location.state) ?? '',
      password: '',
    },
  });
  const { errors, isSubmitting } = form.formState;
  const email = useWatch({ control: form.control, name: 'email' });

  const handleSubmit = form.handleSubmit(async (values) => {
    setUnconfirmedEmail(undefined);

    try {
      await signIn(values);
    } catch (error) {
      if (ApiFailure.codeOf(error) === 'EMAIL_NOT_CONFIRMED') {
        setUnconfirmedEmail(values.email);
        return;
      }

      form.setError('root.server', {
        message: ApiFailure.message(error, {
          INVALID_CREDENTIALS:
            'E-mail ou senha incorretos. Confira e tente de novo.',
          ACCOUNT_UNAVAILABLE: 'Esta conta está desativada.',
          TOO_MANY_REQUESTS,
        }),
      });
    }
  });

  return (
    <VisitorCard
      title="Entrar"
      description="Use o e-mail e a senha da sua conta."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            to="/cadastro"
            className="font-bold text-link underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      {unconfirmedEmail && (
        <FormAlert>
          Confirme o seu e-mail antes de entrar.{' '}
          <Link
            to="/confirmar"
            state={{ email: unconfirmedEmail }}
            className="font-bold text-link underline-offset-4 hover:underline"
          >
            Confirmar e-mail
          </Link>
        </FormAlert>
      )}
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <FieldGroup className="gap-5">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
                <Input
                  {...field}
                  id={`${id}-email`}
                  type="email"
                  autoComplete="username"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-email-error` : undefined
                  }
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${id}-email-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex min-h-10 items-center justify-between gap-3">
                  <FieldLabel htmlFor={`${id}-password`}>Senha</FieldLabel>
                  <Link
                    to="/recuperar-senha"
                    state={{ email: email.trim() }}
                    className="inline-flex min-h-10 items-center rounded-md px-1 font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Esqueci a senha
                  </Link>
                </div>
                <PasswordInput
                  {...field}
                  id={`${id}-password`}
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${id}-password-error` : undefined
                  }
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${id}-password-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
          <SubmitButton
            pending={isSubmitting}
            label="Entrar"
            pendingLabel="Entrando…"
          />
        </FieldGroup>
      </form>
    </VisitorCard>
  );
}
