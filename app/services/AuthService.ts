import axios from 'axios';
import { z } from 'zod';

import { baseURL } from '~/services/httpClient';

const accessTokenSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number(),
});

export type AccessToken = z.infer<typeof accessTokenSchema>;

export class AuthService {
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
