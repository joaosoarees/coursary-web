import { z } from 'zod';

const EMAIL_MESSAGE = 'Informe um e-mail completo, como nome@exemplo.com.';

export const PASSWORD_RULE =
  '8 caracteres ou mais, com uma letra minúscula e um número.';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe o e-mail.')
  .pipe(z.email(EMAIL_MESSAGE).max(254, EMAIL_MESSAGE));

const newPasswordSchema = z
  .string()
  .min(8, PASSWORD_RULE)
  .max(256, 'Use no máximo 256 caracteres.')
  .regex(/[a-z]/, PASSWORD_RULE)
  .regex(/[0-9]/, PASSWORD_RULE);

const codeSchema = z
  .string()
  .trim()
  .min(1, 'Informe o código do e-mail.')
  .regex(/^\S{1,2048}$/, 'O código não tem espaços.');

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Informe a senha.')
    .max(256, 'Use no máximo 256 caracteres.'),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o seu nome.')
    .max(100, 'Use no máximo 100 caracteres.'),
  email: emailSchema,
  password: newPasswordSchema,
});

export const confirmSignUpSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: codeSchema,
  newPassword: newPasswordSchema,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ConfirmSignUpValues = z.infer<typeof confirmSignUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
