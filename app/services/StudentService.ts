import { z } from 'zod';

import { courseUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';

const studentSchema = z.object({
  accountId: z.string(),
  studentName: z.string(),
  enrolledAt: z.string(),
  completedLessons: z.number(),
});

const studentsPageSchema = z.object({
  items: z.array(studentSchema),
  nextCursor: z.string().nullable(),
});

export type Student = z.infer<typeof studentSchema>;
export type StudentsPage = z.infer<typeof studentsPageSchema>;
export type StudentOrder = 'asc' | 'desc';

export class StudentService {
  static async list(
    courseId: string,
    {
      cursor,
      limit,
      order,
    }: { cursor: string | undefined; limit: number; order: StudentOrder },
    signal?: AbortSignal,
  ): Promise<StudentsPage> {
    const { data } = await httpClient.get<unknown>(
      `${courseUrl(courseId)}/students`,
      { params: { cursor, limit, order }, signal },
    );

    return studentsPageSchema.parse(data);
  }
}
