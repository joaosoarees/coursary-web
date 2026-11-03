import { z } from 'zod';

import { httpClient } from '~/services/httpClient';

const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  durationMinutes: z.number(),
  position: z.number(),
});

const moduleSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  lessons: z.array(lessonSchema),
});

const coursePageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  instructorName: z.string(),
  lessonCount: z.number(),
  enrollmentCount: z.number(),
  ratingCount: z.number(),
  ratingAverage: z.number().nullable(),
  publishedAt: z.string(),
  coverUrl: z.record(z.string(), z.string()).optional(),
  modules: z.array(moduleSchema),
});

const reviewSchema = z.object({
  studentName: z.string(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const reviewsPageSchema = z.object({
  items: z.array(reviewSchema),
  nextCursor: z.string().nullable(),
});

export type CoursePage = z.infer<typeof coursePageSchema>;
export type CourseModule = z.infer<typeof moduleSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewsPage = z.infer<typeof reviewsPageSchema>;

export class CourseService {
  static async get(
    courseId: string,
    signal?: AbortSignal,
  ): Promise<CoursePage> {
    const { data } = await httpClient.get<unknown>(
      `/courses/${encodeURIComponent(courseId)}`,
      { signal },
    );

    return coursePageSchema.parse(data);
  }

  static async listReviews(
    {
      courseId,
      cursor,
      limit,
    }: { courseId: string; cursor: string | undefined; limit: number },
    signal?: AbortSignal,
  ): Promise<ReviewsPage> {
    const { data } = await httpClient.get<unknown>(
      `/courses/${encodeURIComponent(courseId)}/reviews`,
      { params: { cursor, limit }, signal },
    );

    return reviewsPageSchema.parse(data);
  }
}
