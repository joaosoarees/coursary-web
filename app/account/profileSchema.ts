import { z } from 'zod';

import { signUpSchema } from '~/auth/authSchemas';

export const profileSchema = z.object({ name: signUpSchema.shape.name });

export type ProfileValues = z.infer<typeof profileSchema>;
