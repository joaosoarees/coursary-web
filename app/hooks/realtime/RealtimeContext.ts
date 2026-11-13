import { createContext, use, useEffect, useEffectEvent } from 'react';
import { z } from 'zod';

import type { LessonRef } from '~/services/QuestionService';

// Only what changed, never the text: each reader reloads over HTTP, where what they may see is
// theirs.
export const realtimeChangeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('questions'), lessonId: z.string() }),
  z.object({
    type: z.literal('answers'),
    lessonId: z.string(),
    questionId: z.string(),
  }),
  z.object({ type: z.literal('notifications') }),
]);

export type RealtimeChange = z.infer<typeof realtimeChangeSchema>;
export type LessonChange = Exclude<RealtimeChange, { type: 'notifications' }>;

export interface LessonWatcher {
  lesson: LessonRef;
  onChange: (change: LessonChange) => void;
  // Every open while watching, the first one included.
  onOpen: () => void;
}

export interface Realtime {
  // Returns the function that stops watching.
  watchLesson: (watcher: LessonWatcher) => () => void;
}

export const RealtimeContext = createContext<Realtime | null>(null);

// Outside the provider (a signed-out page, a test) there is nothing to watch.
export function useWatchLesson(
  lesson: LessonRef | null,
  onChange: (change: LessonChange) => void,
  onOpen: () => void,
) {
  const realtime = use(RealtimeContext);
  const handleChange = useEffectEvent(onChange);
  const handleOpen = useEffectEvent(onOpen);
  const courseId = lesson?.courseId;
  const lessonId = lesson?.lessonId;

  useEffect(() => {
    if (!realtime || !courseId || !lessonId) {
      return;
    }

    return realtime.watchLesson({
      lesson: { courseId, lessonId },
      onChange: (change) => {
        handleChange(change);
      },
      onOpen: () => {
        handleOpen();
      },
    });
  }, [realtime, courseId, lessonId]);
}
