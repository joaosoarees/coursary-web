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

const avatarUploadSchema = z.object({
  fileId: z.string(),
  url: z.url(),
  fields: z.record(z.string(), z.string()),
});

export type AvatarUpload = z.infer<typeof avatarUploadSchema>;

const avatarUploadStatusSchema = z.object({ status: z.string() });

export class AccountService {
  static async getMe(signal?: AbortSignal): Promise<Profile> {
    const { data } = await httpClient.get<unknown>('/me', { signal });

    return profileSchema.parse(data);
  }

  static async updateMe(name: string): Promise<Profile> {
    const { data } = await httpClient.patch<unknown>('/me', { name });

    return profileSchema.parse(data);
  }

  static async requestAvatarUpload(contentType: string): Promise<AvatarUpload> {
    const { data } = await httpClient.post<unknown>('/me/avatar', {
      contentType,
    });

    return avatarUploadSchema.parse(data);
  }

  static async getAvatarUploadStatus(fileId: string): Promise<string> {
    const { data } = await httpClient.get<unknown>(
      `/me/avatar/${encodeURIComponent(fileId)}`,
    );

    return avatarUploadStatusSchema.parse(data).status;
  }
}
