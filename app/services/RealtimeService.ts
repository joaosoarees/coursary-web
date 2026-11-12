import { z } from 'zod';

import { httpClient } from '~/services/httpClient';
import type { LessonRef } from '~/services/QuestionService';

const ticketSchema = z.object({ ticket: z.string().min(1) });

export class RealtimeService {
  // Good for one connection, within 30 seconds: ask again before every attempt. Without a lesson
  // the connection only hears the account's own notices.
  static async ticket(lesson?: LessonRef): Promise<string> {
    const { data } = await httpClient.post<unknown>(
      '/realtime/tickets',
      lesson ? { courseId: lesson.courseId, lessonId: lesson.lessonId } : {},
    );

    return ticketSchema.parse(data).ticket;
  }
}
