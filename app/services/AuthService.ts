import axios from 'axios';
import { z } from 'zod';

import { baseURL, httpClient } from '~/services/httpClient';

const accessTokenSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number(),
});

export type AccessToken = z.infer<typeof accessTokenSchema>;

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ConfirmSignUpInput {
  email: string;
  code: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export class AuthService {
  static async signUp(input: SignUpInput): Promise<void> {
    await httpClient.post('/auth/sign-up', input);
  }

  static async confirmSignUp(input: ConfirmSignUpInput): Promise<void> {
    await httpClient.post('/auth/confirm', input);
  }

  static async resendConfirmationCode(email: string): Promise<void> {
    await httpClient.post('/auth/resend-code', { email });
  }

  static async signIn(input: SignInInput): Promise<AccessToken> {
    const { data } = await httpClient.post<unknown>('/auth/sign-in', input);

    return accessTokenSchema.parse(data);
  }

  static async signOut(): Promise<void> {
    await httpClient.post('/auth/sign-out');
  }

  static async forgotPassword(email: string): Promise<void> {
    await httpClient.post('/auth/forgot-password', { email });
  }

  static async resetPassword(input: ResetPasswordInput): Promise<void> {
    await httpClient.post('/auth/reset-password', input);
  }

  // Bare axios, not httpClient: a 401 here must never start another refresh.
  static async refresh(): Promise<AccessToken> {
    const { data } = await axios.post<unknown>(
      `${baseURL}/auth/refresh`,
      null,
      {
        withCredentials: true,
        timeout: 10_000,
      },
    );

    return accessTokenSchema.parse(data);
  }
}
