import { z } from 'zod';

import { httpClient } from '~/services/httpClient';

const healthSchema = z.object({ status: z.literal('ok') });

export type Health = z.infer<typeof healthSchema>;

export class HealthService {
  static async get(signal?: AbortSignal): Promise<Health> {
    const { data } = await httpClient.get<unknown>('/health', { signal });

    return healthSchema.parse(data);
  }
}
