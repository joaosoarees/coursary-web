import { z } from 'zod';

import { courseUrl } from '~/services/apiPaths';
import { moduleSchema } from '~/services/CourseService';
import { httpClient } from '~/services/httpClient';

const createdModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
});

const createdLessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  durationMinutes: z.number(),
  position: z.number(),
});

const reorderedSchema = z.object({ modules: z.array(moduleSchema) });

export type CreatedLesson = z.infer<typeof createdLessonSchema>;

export interface OutlineOrder {
  modules: { id: string; lessonIds: string[] }[];
}

const moduleUrl = (courseId: string, moduleId: string) =>
  `${courseUrl(courseId)}/modules/${encodeURIComponent(moduleId)}`;

export class OutlineService {
  static async createModule(courseId: string, title: string) {
    const { data } = await httpClient.post<unknown>(
      `${courseUrl(courseId)}/modules`,
      { title },
    );

    return createdModuleSchema.parse(data);
  }

  static async renameModule(courseId: string, moduleId: string, title: string) {
    const { data } = await httpClient.patch<unknown>(
      moduleUrl(courseId, moduleId),
      { title },
    );

    return createdModuleSchema.parse(data);
  }

  static async deleteModule(courseId: string, moduleId: string) {
    await httpClient.delete(moduleUrl(courseId, moduleId));
  }

  static async createLesson(
    courseId: string,
    moduleId: string,
    lesson: { title: string; durationMinutes: number },
  ): Promise<CreatedLesson> {
    const { data } = await httpClient.post<unknown>(
      `${moduleUrl(courseId, moduleId)}/lessons`,
      lesson,
    );

    return createdLessonSchema.parse(data);
  }

  static async deleteLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
  ) {
    await httpClient.delete(
      `${moduleUrl(courseId, moduleId)}/lessons/${encodeURIComponent(lessonId)}`,
    );
  }

  static async reorder(courseId: string, order: OutlineOrder) {
    const { data } = await httpClient.put<unknown>(
      `${courseUrl(courseId)}/outline`,
      order,
    );

    return reorderedSchema.parse(data).modules;
  }
}
