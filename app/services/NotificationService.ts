import { z } from 'zod';

import { httpClient } from '~/services/httpClient';

const kindSchema = z.enum([
  'answer',
  'question',
  'lesson',
  'archived',
  'export-ready',
]);

const notificationSchema = z.object({
  id: z.string(),
  kind: kindSchema,
  courseId: z.string(),
  courseTitle: z.string(),
  lessonId: z.string().optional(),
  lessonTitle: z.string().optional(),
  questionId: z.string().optional(),
  actorName: z.string().optional(),
  byInstructor: z.boolean(),
  exportId: z.string().optional(),
  read: z.boolean(),
  createdAt: z.string(),
});

// The API ships a new kind before the site that shows it: the rest of the inbox still loads.
const knownKind = (item: unknown) =>
  z.object({ kind: kindSchema }).safeParse(item).success;

const notificationsPageSchema = z.object({
  items: z
    .array(z.unknown())
    .transform((items) => items.filter(knownKind))
    .pipe(z.array(notificationSchema)),
  nextCursor: z.string().nullable(),
  // Capped by the API: a full count is 100 or more.
  unreadCount: z.number(),
});

const markedSchema = z.object({ marked: z.number() });

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationsPage = z.infer<typeof notificationsPageSchema>;

interface PageRequest {
  cursor: string | undefined;
  limit: number;
}

const NOTIFICATIONS_URL = '/me/notifications';

export class NotificationService {
  static async list(
    { cursor, limit }: PageRequest,
    signal?: AbortSignal,
  ): Promise<NotificationsPage> {
    const { data } = await httpClient.get<unknown>(NOTIFICATIONS_URL, {
      params: { cursor, limit },
      signal,
    });

    return notificationsPageSchema.parse(data);
  }

  static async markRead(id: string): Promise<void> {
    await httpClient.post(
      `${NOTIFICATIONS_URL}/${encodeURIComponent(id)}/read`,
    );
  }

  static async markAllRead(): Promise<number> {
    const { data } = await httpClient.post<unknown>(
      `${NOTIFICATIONS_URL}/read-all`,
    );

    return markedSchema.parse(data).marked;
  }
}
