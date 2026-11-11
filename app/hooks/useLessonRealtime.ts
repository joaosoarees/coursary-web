import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { z } from 'zod';

import { useWebSocket } from '~/hooks/websocket/useWebSocket';
import { env } from '~/lib/env';
import {
  answersQuery,
  lessonQuestionsKey,
  questionsQuery,
} from '~/queries/questions';
import type { LessonRef } from '~/services/QuestionService';
import { RealtimeService } from '~/services/RealtimeService';

// Only what changed, never the text: each reader reloads over HTTP, where canDelete is theirs.
const changeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('questions'), lessonId: z.string() }),
  z.object({
    type: z.literal('answers'),
    lessonId: z.string(),
    questionId: z.string(),
  }),
]);

export type LessonChange = z.infer<typeof changeSchema>;

export function useLessonRealtime(lesson: LessonRef, enabled: boolean) {
  const queryClient = useQueryClient();
  const opened = useRef(false);

  const reload = (queryKey: readonly unknown[]) =>
    queryClient.invalidateQueries({ queryKey });

  const onMessage = (change: LessonChange) => {
    if (change.lessonId !== lesson.lessonId) {
      return;
    }

    const list = questionsQuery(lesson).queryKey;

    // An answer also changes its question's count on the list.
    if (change.type === 'answers') {
      void reload(
        answersQuery({ ...lesson, questionId: change.questionId }).queryKey,
      );
    }

    void reload(list);
  };

  // What changed while the socket was down only exists on the server: reload all of it.
  const onOpen = () => {
    if (opened.current) {
      void reload(lessonQuestionsKey(lesson));
    }

    opened.current = true;
  };

  return useWebSocket({
    url: enabled ? env.VITE_WS_URL : null,
    getTicket: () => RealtimeService.ticket(lesson),
    schema: changeSchema,
    onMessage,
    onOpen,
  });
}
