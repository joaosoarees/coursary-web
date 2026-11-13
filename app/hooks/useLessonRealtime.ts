import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import {
  type LessonChange,
  useWatchLesson,
} from '~/hooks/realtime/RealtimeContext';
import {
  answersQuery,
  lessonQuestionsKey,
  questionsQuery,
} from '~/queries/questions';
import type { LessonRef } from '~/services/QuestionService';

export function useLessonRealtime(lesson: LessonRef, enabled: boolean) {
  const queryClient = useQueryClient();
  const opened = useRef(false);

  const reload = (queryKey: readonly unknown[]) =>
    queryClient.invalidateQueries({ queryKey });

  const onChange = (change: LessonChange) => {
    // An answer also changes its question's count on the list.
    if (change.type === 'answers') {
      void reload(
        answersQuery({ ...lesson, questionId: change.questionId }).queryKey,
      );
    }

    void reload(questionsQuery(lesson).queryKey);
  };

  // What changed while the socket was down only exists on the server: reload all of it.
  const onOpen = () => {
    if (opened.current) {
      void reload(lessonQuestionsKey(lesson));
    }

    opened.current = true;
  };

  useWatchLesson(enabled ? lesson : null, onChange, onOpen);
}
