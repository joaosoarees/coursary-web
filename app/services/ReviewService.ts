import { z } from 'zod';

import { ApiFailure } from '~/services/ApiFailure';
import { courseUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';

const myReviewSchema = z.object({
  courseId: z.string(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MyReview = z.infer<typeof myReviewSchema>;

export class ReviewService {
  // The student's own review; the API answers 404 until there is one.
  static async mine(
    courseId: string,
    signal?: AbortSignal,
  ): Promise<MyReview | null> {
    try {
      const { data } = await httpClient.get<unknown>(
        `${courseUrl(courseId)}/review`,
        { signal },
      );

      return myReviewSchema.parse(data);
    } catch (error) {
      if (ApiFailure.codeOf(error) === 'REVIEW_NOT_FOUND') {
        return null;
      }

      throw error;
    }
  }

  static async save({
    courseId,
    rating,
    comment,
  }: {
    courseId: string;
    rating: number;
    comment: string;
  }): Promise<MyReview> {
    const { data } = await httpClient.put<unknown>(
      `${courseUrl(courseId)}/review`,
      { rating, comment },
    );

    return myReviewSchema.parse(data);
  }
}
