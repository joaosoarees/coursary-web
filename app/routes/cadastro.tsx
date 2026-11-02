import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { TOO_MANY_REQUESTS } from '~/auth/authMessages';
import {
  PASSWORD_RULE,
  signUpSchema,
  type SignUpValues,
} from '~/auth/authSchemas';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { FormAlert } from '~/components/visitor/FormMessage';
import { PasswordInput } from '~/components/visitor/PasswordInput';
import { SubmitButton } from '~/components/visitor/SubmitButton';
import { VisitorCard } from '~/components/visitor/VisitorCard';
import { useSignUp } from '~/mutations/auth';
import { ApiFailure } from '~/services/ApiFailure';

import type { Route } from './+types/cadastro';

export const meta: Route.MetaFunction = () => [
  { title: 'Criar conta · Coursary' },
];

const linkClass = 'font-bold text-link underline-offset-4 hover:underline';

export default function SignUp() {
  const id = useId();
  const navigate = useNavigate();
  const signUp = useSignUp();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await signUp.mutateAsync(values);
      void navigate('/confirmar', { state: { email: values.email } });
    } catch (error) {
      const code = ApiFailure.codeOf(error);

      if (code === 'EMAIL_IN_USE') {
        form.setError(
          'email',
          { type: 'server', message: 'Já existe uma conta com este e-mail.' },
          { shouldFocus: true },
        );
        return;
      }

      if (code === 'INVALID_PASSWORD') {
        form.setError(
          'password',
          { type: 'server', message: PASSWORD_RULE },
          { shouldFocus: true },
        );
        return;
      }

      form.setError('root.server', {
        message: ApiFailure.message(error, { TOO_MANY_REQUESTS }),
      });
    }
  });

  return (
    <VisitorCard
      title="Criar conta"
      description="Uma conta só para estudar e para publicar os seus cursos."
      step={{ current: 1, total: 2 }}
      back={{ to: '/entrar', label: 'Voltar para a entrada' }}
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/entrar" className={linkClass}>
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
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-name`}>Nome</FieldLabel>
                <Input
                  {...field}
                  id={`${id}-name`}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={`${id}-name-hint`}
                />
                {fieldState.invalid ? (
                  <FieldError
                    id={`${id}-name-hint`}
                    errors={[fieldState.error]}
                  />
                ) : (
                  <FieldDescription id={`${id}-name-hint`}>
                    Aparece no seu perfil e nos cursos que publicar.
                  </FieldDescription>
                )}
              </Field>
            )}
          />
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
                {fieldState.error?.type === 'server' ? (
                  <FieldError id={`${id}-email-error`}>
                    {fieldState.error.message}{' '}
                    <Link
                      to="/entrar"
                      state={{ email: field.value.trim() }}
                      className={linkClass}
                    >
                      Entrar
                    </Link>{' '}
                    ou{' '}
                    <Link
                      to="/recuperar-senha"
                      state={{ email: field.value.trim() }}
                      className={linkClass}
                    >
                      recuperar a senha
                    </Link>
                    .
                  </FieldError>
                ) : (
                  fieldState.invalid && (
                    <FieldError
                      id={`${id}-email-error`}
                      errors={[fieldState.error]}
                    />
                  )
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-password`}>Senha</FieldLabel>
                <PasswordInput
                  {...field}
                  id={`${id}-password`}
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={`${id}-password-rule`}
                />
                {fieldState.invalid ? (
                  <FieldError
                    id={`${id}-password-rule`}
                    errors={[fieldState.error]}
                  />
                ) : (
                  <FieldDescription id={`${id}-password-rule`}>
                    {PASSWORD_RULE}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
          <SubmitButton
            pending={isSubmitting}
            label="Criar conta"
            pendingLabel="Criando conta…"
          />
        </FieldGroup>
      </form>
    </VisitorCard>
  );
}
