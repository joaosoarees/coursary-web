import { z } from 'zod';

export const BODY_MAX_BYTES = 32 * 1024;

// The API counts the body in UTF-8 bytes, not in characters: an accent takes two.
export const bodyBytes = (body: string) =>
  new TextEncoder().encode(body).length;

export const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Dê um título à aula.')
    .min(3, 'Use ao menos 3 caracteres no título.')
    .max(120, 'Use no máximo 120 caracteres no título.'),
  durationMinutes: z
    .number({ error: 'Informe a duração em minutos.' })
    .int('Use minutos inteiros.')
    .min(1, 'De 1 a 600 minutos.')
    .max(600, 'De 1 a 600 minutos.'),
  body: z.string().refine((body) => bodyBytes(body) <= BODY_MAX_BYTES, {
    message:
      'O texto passou de 32 KiB. Encurte-o ou mova parte para o material.',
  }),
});

export type LessonValues = z.infer<typeof lessonSchema>;
