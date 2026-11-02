import { z } from 'zod';

import { httpClient } from '~/services/httpClient';

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['student', 'instructor', 'admin']),
  avatarUrl: z.record(z.string(), z.string()).optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export class AccountService {
  static async getMe(signal?: AbortSignal): Promise<Profile> {
    const { data } = await httpClient.get<unknown>('/me', { signal });

    return profileSchema.parse(data);
  }
}
