import { z } from 'zod';

import { httpClient } from '~/services/httpClient';

const courseStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

const myCourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: courseStatusSchema,
  lessonCount: z.number(),
  enrollmentCount: z.number(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  coverUrl: z.record(z.string(), z.string()).optional(),
});

const myCoursesPageSchema = z.object({
  items: z.array(myCourseSchema),
  nextCursor: z.string().nullable(),
});

export type CourseStatus = z.infer<typeof courseStatusSchema>;
export type MyCourse = z.infer<typeof myCourseSchema>;
export type MyCoursesPage = z.infer<typeof myCoursesPageSchema>;

export class InstructorService {
  static async listMine(
    { cursor, limit }: { cursor: string | undefined; limit: number },
    signal?: AbortSignal,
  ): Promise<MyCoursesPage> {
    const { data } = await httpClient.get<unknown>('/instructor/courses', {
      params: { cursor, limit },
      signal,
    });

    return myCoursesPageSchema.parse(data);
  }
}
