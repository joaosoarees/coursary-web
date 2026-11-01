import { z } from 'zod';

import { envSchema } from '~/lib/envSchema';

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = { ...parsed.data, DEV: import.meta.env.DEV };
