import { useMutation, useQueryClient } from '@tanstack/react-query';

import { outlineQuery } from '~/queries/lesson';
import {
  answersQuery,
  lessonQuestionsKey,
  questionKey,
  questionsQuery,
} from '~/queries/questions';
import { ApiFailure } from '~/services/ApiFailure';
import {
  type LessonRef,
  type QuestionRef,
  QuestionService,
} from '~/services/QuestionService';

// A refusal means the screen was out of date: the course was archived, or the question changed
// under the caller. Every outcome reloads what it touched; an archived course also reloads the
// outline, whose status turns the section read-only.
const useRefresh = (lesson: LessonRef) => {
  const queryClient = useQueryClient();

  return (error: Error | null, keys: (readonly unknown[])[]) => {
    const refreshes = keys.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    );

    if (ApiFailure.codeOf(error) === 'COURSE_ARCHIVED') {
      refreshes.push(
        queryClient.invalidateQueries({
          queryKey: outlineQuery(lesson.courseId).queryKey,
          exact: true,
        }),
      );
    }

    return Promise.all(refreshes);
  };
};

const listOnly = (lesson: LessonRef) => questionsQuery(lesson).queryKey;

export const useAskQuestion = (lesson: LessonRef) => {
  const refresh = useRefresh(lesson);

  return useMutation({
    mutationFn: (text: string) => QuestionService.ask(lesson, text),
    onSettled: (_question, error) => refresh(error, [listOnly(lesson)]),
  });
};

export const useAnswerQuestion = (question: QuestionRef) => {
  const refresh = useRefresh(question);

  return useMutation({
    mutationFn: (text: string) => QuestionService.answer(question, text),
    onSettled: (_answer, error) =>
      refresh(error, [answersQuery(question).queryKey, listOnly(question)]),
  });
};

export const useDeleteQuestion = (lesson: LessonRef) => {
  const refresh = useRefresh(lesson);

  return useMutation({
    mutationFn: (questionId: string) =>
      QuestionService.remove({ ...lesson, questionId }),
    onSettled: (_result, error) => refresh(error, [lessonQuestionsKey(lesson)]),
  });
};

export const useDeleteAnswer = (question: QuestionRef) => {
  const refresh = useRefresh(question);

  return useMutation({
    mutationFn: (answerId: string) =>
      QuestionService.removeAnswer(question, answerId),
    onSettled: (_result, error) =>
      refresh(error, [questionKey(question), listOnly(question)]),
  });
};
