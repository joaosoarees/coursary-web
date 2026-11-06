import { z } from 'zod';

import { courseUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';

const startedSchema = z.object({
  fileId: z.string(),
  partSize: z.number().int().positive(),
  partCount: z.number().int().positive(),
});

const partUrlsSchema = z.object({
  urls: z.array(z.object({ partNumber: z.number(), url: z.url() })),
});

export type StartedVideo = z.infer<typeof startedSchema>;
export type PartUrl = z.infer<typeof partUrlsSchema>['urls'][number];
export interface SentPart {
  partNumber: number;
  eTag: string;
}

export interface LessonRef {
  courseId: string;
  lessonId: string;
}

const videoUrl = ({ courseId, lessonId }: LessonRef) =>
  `${courseUrl(courseId)}/lessons/${encodeURIComponent(lessonId)}/video`;

export class VideoService {
  // Opening a new upload aborts the lesson's pending one, if any.
  static async start(
    lesson: LessonRef,
    file: { contentType: string; size: number },
    signal?: AbortSignal,
  ): Promise<StartedVideo> {
    const { data } = await httpClient.post<unknown>(videoUrl(lesson), file, {
      signal,
    });

    return startedSchema.parse(data);
  }

  static async partUrls(
    lesson: LessonRef,
    fileId: string,
    partNumbers: number[],
    signal?: AbortSignal,
  ): Promise<PartUrl[]> {
    const { data } = await httpClient.post<unknown>(
      `${videoUrl(lesson)}/part-urls`,
      { fileId, partNumbers },
      { signal },
    );

    return partUrlsSchema.parse(data).urls;
  }

  static async complete(
    lesson: LessonRef,
    fileId: string,
    parts: SentPart[],
  ): Promise<void> {
    await httpClient.post(`${videoUrl(lesson)}/complete`, { fileId, parts });
  }

  static async abort(lesson: LessonRef, fileId: string): Promise<void> {
    await httpClient.post(`${videoUrl(lesson)}/abort`, { fileId });
  }

  static async delete(lesson: LessonRef): Promise<void> {
    await httpClient.delete(videoUrl(lesson));
  }
}
