import { z } from 'zod';

import { courseUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';
import type { PresignedPost } from '~/services/S3Upload';

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

const managedCourseSchema = myCourseSchema.extend({
  description: z.string(),
});

const coverUploadSchema = z.object({
  fileId: z.string(),
  url: z.url(),
  fields: z.record(z.string(), z.string()),
});

const coverUploadStatusSchema = z.object({ status: z.string() });

export type CourseStatus = z.infer<typeof courseStatusSchema>;
export type MyCourse = z.infer<typeof myCourseSchema>;
export type MyCoursesPage = z.infer<typeof myCoursesPageSchema>;
export type ManagedCourse = z.infer<typeof managedCourseSchema>;
export type CourseInfo = Pick<ManagedCourse, 'title' | 'description'>;
export type CoverUpload = PresignedPost & { fileId: string };

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

  static async get(
    courseId: string,
    signal?: AbortSignal,
  ): Promise<ManagedCourse> {
    const { data } = await httpClient.get<unknown>(
      `/instructor/courses/${encodeURIComponent(courseId)}`,
      { signal },
    );

    return managedCourseSchema.parse(data);
  }

  static async create(info: CourseInfo): Promise<ManagedCourse> {
    const { data } = await httpClient.post<unknown>('/courses', info);

    return managedCourseSchema.parse(data);
  }

  static async update(
    courseId: string,
    info: CourseInfo,
  ): Promise<ManagedCourse> {
    const { data } = await httpClient.patch<unknown>(courseUrl(courseId), info);

    return managedCourseSchema.parse(data);
  }

  static async requestCoverUpload(
    courseId: string,
    contentType: string,
  ): Promise<CoverUpload> {
    const { data } = await httpClient.post<unknown>(
      `${courseUrl(courseId)}/cover`,
      { contentType },
    );

    return coverUploadSchema.parse(data);
  }

  static async getCoverUploadStatus(
    courseId: string,
    fileId: string,
  ): Promise<string> {
    const { data } = await httpClient.get<unknown>(
      `${courseUrl(courseId)}/cover/${encodeURIComponent(fileId)}`,
    );

    return coverUploadStatusSchema.parse(data).status;
  }

  static async publish(courseId: string): Promise<ManagedCourse> {
    const { data } = await httpClient.post<unknown>(
      `${courseUrl(courseId)}/publish`,
    );

    return managedCourseSchema.parse(data);
  }

  static async archive(courseId: string): Promise<ManagedCourse> {
    const { data } = await httpClient.post<unknown>(
      `${courseUrl(courseId)}/archive`,
    );

    return managedCourseSchema.parse(data);
  }

  // 202: the draft is marked for deletion and its content goes in the background.
  static async deleteDraft(courseId: string): Promise<void> {
    await httpClient.delete(courseUrl(courseId));
  }
}
