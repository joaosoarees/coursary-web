import { z } from 'zod';

export const DESCRIPTION_MAX = 5000;

export const courseInfoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Use ao menos 3 caracteres no título.')
    .max(120, 'Use no máximo 120 caracteres no título.'),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX,
      `Use no máximo ${String(DESCRIPTION_MAX)} caracteres.`,
    ),
});

export type CourseInfoValues = z.infer<typeof courseInfoSchema>;
