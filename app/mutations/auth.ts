import { useMutation } from '@tanstack/react-query';

import {
  AuthService,
  type ConfirmSignUpInput,
  type ResetPasswordInput,
  type SignUpInput,
} from '~/services/AuthService';

export const useSignUp = () =>
  useMutation({
    mutationFn: (input: SignUpInput) => AuthService.signUp(input),
  });

export const useConfirmSignUp = () =>
  useMutation({
    mutationFn: (input: ConfirmSignUpInput) => AuthService.confirmSignUp(input),
  });

export const useResendConfirmationCode = () =>
  useMutation({
    mutationFn: (email: string) => AuthService.resendConfirmationCode(email),
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (input: ResetPasswordInput) => AuthService.resetPassword(input),
  });
