import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { INVALID_CODE, TOO_MANY_REQUESTS } from '~/auth/authMessages';
import {
  confirmSignUpSchema,
  type ConfirmSignUpValues,
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
import { ResendCodeButton } from '~/components/visitor/ResendCodeButton';
import { SubmitButton } from '~/components/visitor/SubmitButton';
import { useResendCode } from '~/components/visitor/useResendCode';
import { VisitorCard } from '~/components/visitor/VisitorCard';
import { useConfirmSignUp, useResendConfirmationCode } from '~/mutations/auth';
import { ApiFailure } from '~/services/ApiFailure';

import type { Route } from './+types/confirmar';

export const meta: Route.MetaFunction = () => [
  { title: 'Confirmar o e-mail · Coursary' },
];

export default function ConfirmSignUp() {
  const id = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const passedEmail = LocationState.email(location.state);
  const confirmSignUp = useConfirmSignUp();
  const resendCode = useResendConfirmationCode();
  const resend = useResendCode(resendCode.mutateAsync);
  const form = useForm<ConfirmSignUpValues>({
    resolver: zodResolver(confirmSignUpSchema),
    defaultValues: { email: passedEmail ?? '', code: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const handleResend = async () => {
    if (await form.trigger('email')) {
      await resend.resend(form.getValues('email').trim());
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await confirmSignUp.mutateAsync(values);
      toast.success('E-mail confirmado. Entre para começar.');
      void navigate('/entrar', {
        state: {
          email: values.email,
          from: LocationState.from(location.state),
        },
      });
    } catch (error) {
      if (ApiFailure.codeOf(error) === 'INVALID_CODE') {
        form.setError('code', { type: 'server', message: '' });
      }

      form.setError('root.server', {
        message: ApiFailure.message(error, { INVALID_CODE, TOO_MANY_REQUESTS }),
      });
    }
  });

  return (
    <VisitorCard
      title="Confirme seu e-mail"
      description={
        passedEmail ? (
          <>
            Mandamos um código para{' '}
            <strong className="font-bold text-foreground">{passedEmail}</strong>
            . Digite-o abaixo para ativar a conta.
          </>
        ) : (
          'Informe o e-mail do cadastro e o código que mandamos para ele.'
        )
      }
      step={{ current: 2, total: 2 }}
      back={{ to: '/entrar', label: 'Voltar para a entrada' }}
      footer={
        <>
          Já confirmou?{' '}
          <Link
            to="/entrar"
            state={{ email: passedEmail }}
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
      {resend.failure && <FormAlert>{resend.failure}</FormAlert>}
      {resend.sentTo && (
        <FormNotice>
          Mandamos um código novo para {resend.sentTo}. O anterior deixou de
          valer.
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
          <SubmitButton
            pending={isSubmitting}
            label="Confirmar e-mail"
            pendingLabel="Confirmando…"
          />
        </FieldGroup>
      </form>
    </VisitorCard>
  );
}
