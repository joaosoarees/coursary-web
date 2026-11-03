import { z } from 'zod';

import { ApiFailure } from '~/services/ApiFailure';
import { httpClient } from '~/services/httpClient';

const progressSchema = z.object({
  completedLessons: z.number(),
  completedLessonIds: z.array(z.string()),
  lastLessonId: z.string().nullable(),
  positionSeconds: z.number().nullable(),
});

const enrollmentSummarySchema = z.object({
  courseId: z.string(),
  title: z.string(),
  instructorName: z.string(),
  lessonCount: z.number(),
  completedLessons: z.number(),
  enrolledAt: z.string(),
  courseStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  coverUrl: z.record(z.string(), z.string()).optional(),
});

const enrollmentsPageSchema = z.object({
  items: z.array(enrollmentSummarySchema),
  nextCursor: z.string().nullable(),
});

export type Progress = z.infer<typeof progressSchema>;
export type EnrollmentSummary = z.infer<typeof enrollmentSummarySchema>;
export type EnrollmentsPage = z.infer<typeof enrollmentsPageSchema>;

const courseUrl = (courseId: string) =>
  `/courses/${encodeURIComponent(courseId)}`;

export class EnrollmentService {
  static async listMine(
    { cursor, limit }: { cursor: string | undefined; limit: number },
    signal?: AbortSignal,
  ): Promise<EnrollmentsPage> {
    const { data } = await httpClient.get<unknown>('/me/enrollments', {
      params: { cursor, limit },
      signal,
    });

    return enrollmentsPageSchema.parse(data);
  }

  // The API refuses the progress of a course the caller is not enrolled in: that refusal is the
  // only way to tell that there is no enrollment.
  static async progress(
    courseId: string,
    signal?: AbortSignal,
  ): Promise<Progress | null> {
    try {
      const { data } = await httpClient.get<unknown>(
        `${courseUrl(courseId)}/progress`,
        { signal },
      );

      return progressSchema.parse(data);
    } catch (error) {
      if (ApiFailure.codeOf(error) === 'FORBIDDEN') {
        return null;
      }

      throw error;
    }
  }

  static async enroll(courseId: string): Promise<void> {
    await httpClient.put(`${courseUrl(courseId)}/enrollment`);
  }

  static async cancel(courseId: string): Promise<void> {
    await httpClient.delete(`${courseUrl(courseId)}/enrollment`);
  }
}
