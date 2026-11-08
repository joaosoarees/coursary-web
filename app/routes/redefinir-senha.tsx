import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { INVALID_CODE, TOO_MANY_REQUESTS } from '~/auth/authMessages';
import {
  PASSWORD_RULE,
  resetPasswordSchema,
  type ResetPasswordValues,
} from '~/auth/authSchemas';
import { LocationState } from '~/auth/LocationState';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { CodeInput } from '~/components/visitor/CodeInput';
import { FormAlert, FormNotice } from '~/components/visitor/FormMessage';
import { PasswordInput } from '~/components/visitor/PasswordInput';
import { ResendCodeButton } from '~/components/visitor/ResendCodeButton';
import { SubmitButton } from '~/components/visitor/SubmitButton';
import { useResendCode } from '~/components/visitor/useResendCode';
import { VisitorCard } from '~/components/visitor/VisitorCard';
import { useForgotPassword, useResetPassword } from '~/mutations/auth';
import { ApiFailure } from '~/services/ApiFailure';

import type { Route } from './+types/redefinir-senha';

export const meta: Route.MetaFunction = () => [
  { title: 'Criar uma senha nova · Coursary' },
];

export default function ResetPassword() {
  const id = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const passedEmail = LocationState.email(location.state);
  const resetPassword = useResetPassword();
  const forgotPassword = useForgotPassword();
  const resend = useResendCode(forgotPassword.mutateAsync);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: passedEmail ?? '', code: '', newPassword: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const handleResend = async () => {
    if (await form.trigger('email')) {
      await resend.resend(form.getValues('email').trim());
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await resetPassword.mutateAsync(values);
      toast.success('Senha alterada. Entre com a senha nova.');
      void navigate('/entrar', { state: { email: values.email } });
    } catch (error) {
      const code = ApiFailure.codeOf(error);

      if (code === 'INVALID_PASSWORD') {
        form.setError(
          'newPassword',
          { type: 'server', message: PASSWORD_RULE },
          { shouldFocus: true },
        );
        return;
      }

      if (code === 'INVALID_CODE') {
        form.setError('code', { type: 'server', message: '' });
      }

      form.setError('root.server', {
        message: ApiFailure.message(error, { INVALID_CODE, TOO_MANY_REQUESTS }),
      });
    }
  });

  return (
    <VisitorCard
      title="Criar uma senha nova"
      description={
        passedEmail ? (
          <>
            Se houver uma conta com{' '}
            <strong className="font-bold text-foreground">{passedEmail}</strong>
            , o código chegou nela. Confira também o spam.
          </>
        ) : (
          'Informe o e-mail da conta, o código que recebeu e a senha nova.'
        )
      }
      step={{ current: 2, total: 2 }}
      back={{ to: '/entrar', label: 'Voltar para a entrada' }}
      footer={
        <Link
          to="/recuperar-senha"
          className="font-bold text-link underline-offset-4 hover:underline"
        >
          Usar outro e-mail
        </Link>
      }
    >
      {errors.root?.server && (
        <FormAlert>{errors.root.server.message}</FormAlert>
      )}
      {resend.failure && <FormAlert>{resend.failure}</FormAlert>}
      {resend.sentTo && (
        <FormNotice>
          Se houver uma conta com {resend.sentTo}, mandamos um código novo para
          ela. O anterior deixou de valer.
        </FormNotice>
      )}
      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <FieldGroup className="gap-5">
          {!passedEmail && (
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
          )}
          <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex min-h-10 items-center justify-between gap-3">
                  <FieldLabel htmlFor={`${id}-code`}>Código</FieldLabel>
                  <ResendCodeButton
                    remaining={resend.remaining}
                    pending={resend.pending}
                    onResend={() => void handleResend()}
                  />
                </div>
                <CodeInput
                  {...field}
                  id={`${id}-code`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={`${id}-code-hint`}
                />
                {fieldState.error?.message ? (
                  <FieldError
                    id={`${id}-code-hint`}
                    errors={[fieldState.error]}
                  />
                ) : (
                  <FieldDescription id={`${id}-code-hint`}>
                    Os 6 dígitos do e-mail que enviamos.
                  </FieldDescription>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-password`}>Senha nova</FieldLabel>
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
            label="Salvar senha nova"
            pendingLabel="Salvando…"
          />
        </FieldGroup>
      </form>
    </VisitorCard>
  );
}
