import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { TOO_MANY_CODE_REQUESTS } from '~/auth/authMessages';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '~/auth/authSchemas';
import { LocationState } from '~/auth/LocationState';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { FormAlert } from '~/components/visitor/FormMessage';
import { SubmitButton } from '~/components/visitor/SubmitButton';
import { VisitorCard } from '~/components/visitor/VisitorCard';
import { useForgotPassword } from '~/mutations/auth';
import { ApiFailure } from '~/services/ApiFailure';

import type { Route } from './+types/recuperar-senha';

export const meta: Route.MetaFunction = () => [
  { title: 'Recuperar a senha · Coursary' },
];

export default function ForgotPassword() {
  const id = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: LocationState.email(location.state) ?? '' },
  });
  const { errors, isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await forgotPassword.mutateAsync(email);
      void navigate('/redefinir-senha', { state: { email } });
    } catch (error) {
      form.setError('root.server', {
        message: ApiFailure.message(error, {
          TOO_MANY_REQUESTS: TOO_MANY_CODE_REQUESTS,
        }),
      });
    }
  });

  return (
    <VisitorCard
      title="Recuperar a senha"
      description="Informe o e-mail da conta. Mandamos um código para você criar uma senha nova."
      step={{ current: 1, total: 2 }}
      back={{ to: '/entrar', label: 'Voltar para a entrada' }}
      footer={
        <>
          Lembrou a senha?{' '}
          <Link
            to="/entrar"
            className="font-bold text-link underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
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
          <SubmitButton
            pending={isSubmitting}
            label="Enviar código"
            pendingLabel="Enviando código…"
          />
        </FieldGroup>
      </form>
    </VisitorCard>
  );
}
