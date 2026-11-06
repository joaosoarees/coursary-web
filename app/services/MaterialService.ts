import { z } from 'zod';

import { courseUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';
import type { Attachment } from '~/services/LessonService';

const uploadSchema = z.object({
  fileId: z.string(),
  url: z.url(),
  fields: z.record(z.string(), z.string()),
});

const orderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      contentType: z.string(),
      size: z.number(),
    }),
  ),
});

const attachmentsUrl = (courseId: string, lessonId: string) =>
  `${courseUrl(courseId)}/lessons/${encodeURIComponent(lessonId)}/attachments`;

export class MaterialService {
  static async requestUpload(
    courseId: string,
    lessonId: string,
    file: { contentType: string; fileName: string },
  ) {
    const { data } = await httpClient.post<unknown>(
      attachmentsUrl(courseId, lessonId),
      file,
    );

    return uploadSchema.parse(data);
  }

  static async delete(courseId: string, lessonId: string, fileId: string) {
    await httpClient.delete(
      `${attachmentsUrl(courseId, lessonId)}/${encodeURIComponent(fileId)}`,
    );
  }

  static async reorder(
    courseId: string,
    lessonId: string,
    fileIds: string[],
  ): Promise<Attachment[]> {
    const { data } = await httpClient.put<unknown>(
      `${attachmentsUrl(courseId, lessonId)}/order`,
      { fileIds },
    );

    return orderSchema.parse(data).items;
  }
}
