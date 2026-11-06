import { z } from 'zod';

const title = z
  .string()
  .trim()
  .min(1, 'Dê um título.')
  .min(3, 'Use ao menos 3 caracteres.')
  .max(120, 'Use no máximo 120 caracteres.');

export const moduleTitleSchema = z.object({ title });

export const newLessonSchema = z.object({
  title,
  durationMinutes: z
    .number({ error: 'Informe a duração em minutos.' })
    .int('Use minutos inteiros.')
    .min(1, 'De 1 a 600 minutos.')
    .max(600, 'De 1 a 600 minutos.'),
});

export type ModuleTitleValues = z.infer<typeof moduleTitleSchema>;
export type NewLessonValues = z.infer<typeof newLessonSchema>;
