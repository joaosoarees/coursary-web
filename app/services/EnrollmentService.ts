import { z } from 'zod';

import { ApiFailure } from '~/services/ApiFailure';
import { httpClient } from '~/services/httpClient';

const progressSchema = z.object({
  completedLessons: z.number(),
  completedLessonIds: z.array(z.string()),
  lastLessonId: z.string().nullable(),
  positionSeconds: z.number().nullable(),
});

export type Progress = z.infer<typeof progressSchema>;

const courseUrl = (courseId: string) =>
  `/courses/${encodeURIComponent(courseId)}`;

export class EnrollmentService {
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
