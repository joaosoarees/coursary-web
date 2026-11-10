import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import {
  type LessonRef,
  type QuestionRef,
  QuestionService,
} from '~/services/QuestionService';

export const QUESTIONS_PAGE_SIZE = 10;
export const ANSWERS_PAGE_SIZE = 20;

// A root of their own: under the lesson's key, an invalidation by prefix would also refetch the
// lesson, whose new video address restarts the player.
export const lessonQuestionsKey = ({ courseId, lessonId }: LessonRef) =>
  ['questions', courseId, lessonId] as const;

export const questionKey = ({ questionId, ...lesson }: QuestionRef) =>
  [...lessonQuestionsKey(lesson), questionId] as const;

export const questionsQuery = (lesson: LessonRef) =>
  infiniteQueryOptions({
    queryKey: [...lessonQuestionsKey(lesson), { limit: QUESTIONS_PAGE_SIZE }],
    queryFn: ({ pageParam, signal }) =>
      QuestionService.list(
        lesson,
        { cursor: pageParam, limit: QUESTIONS_PAGE_SIZE },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });

export const answersQuery = (question: QuestionRef) =>
  infiniteQueryOptions({
    queryKey: [
      ...questionKey(question),
      'answers',
      { limit: ANSWERS_PAGE_SIZE },
    ],
    queryFn: ({ pageParam, signal }) =>
      QuestionService.answers(
        question,
        { cursor: pageParam, limit: ANSWERS_PAGE_SIZE },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });

export const useQuestions = (lesson: LessonRef, enabled = true) =>
  useInfiniteQuery({ ...questionsQuery(lesson), enabled });

export const useAnswers = (question: QuestionRef) =>
  useInfiniteQuery(answersQuery(question));
