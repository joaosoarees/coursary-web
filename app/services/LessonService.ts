import { z } from 'zod';

import { courseUrl, lessonUrl } from '~/services/apiPaths';
import { moduleSchema } from '~/services/CourseService';
import { httpClient } from '~/services/httpClient';

const outlineSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  status: z.string(),
  modules: z.array(moduleSchema),
});

const signedUrlSchema = z.object({
  url: z.string(),
  expiresIn: z.number(),
});

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  contentType: z.string(),
  size: z.number(),
});

const lessonContentSchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  body: z.string(),
  attachments: z.array(attachmentSchema),
  video: signedUrlSchema.optional(),
});

export type CourseOutline = z.infer<typeof outlineSchema>;
export type LessonContent = z.infer<typeof lessonContentSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type SignedUrl = z.infer<typeof signedUrlSchema>;

export class LessonService {
  static async outline(
    courseId: string,
    signal?: AbortSignal,
  ): Promise<CourseOutline> {
    const { data } = await httpClient.get<unknown>(
      `${courseUrl(courseId)}/outline`,
      { signal },
    );

    return outlineSchema.parse(data);
  }

  static async open(
    { courseId, lessonId }: { courseId: string; lessonId: string },
    signal?: AbortSignal,
  ): Promise<LessonContent> {
    const { data } = await httpClient.get<unknown>(
      lessonUrl(courseId, lessonId),
      { signal },
    );

    return lessonContentSchema.parse(data);
  }

  static async attachmentDownload({
    courseId,
    lessonId,
    fileId,
  }: {
    courseId: string;
    lessonId: string;
    fileId: string;
  }): Promise<SignedUrl> {
    const { data } = await httpClient.get<unknown>(
      `${lessonUrl(courseId, lessonId)}/attachments/${encodeURIComponent(fileId)}`,
    );

    return signedUrlSchema.parse(data);
  }
}
