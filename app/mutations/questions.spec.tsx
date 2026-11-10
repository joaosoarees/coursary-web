import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useAnswerQuestion,
  useAskQuestion,
  useDeleteAnswer,
  useDeleteQuestion,
} from '~/mutations/questions';
import { lessonQuery, outlineQuery } from '~/queries/lesson';
import { answersQuery, questionsQuery } from '~/queries/questions';
import { QuestionService } from '~/services/QuestionService';
import { apiError } from '~/test/renderRoutes';

const lesson = { courseId: 'c1', lessonId: 'l1' };
const first = { ...lesson, questionId: 'q1' };
const second = { ...lesson, questionId: 'q2' };
const emptyPages = { pages: [], pageParams: [] };

let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(outlineQuery('c1').queryKey, {} as never);
  client.setQueryData(lessonQuery('c1', 'l1').queryKey, {} as never);
  client.setQueryData(questionsQuery(lesson).queryKey, emptyPages);
  client.setQueryData(answersQuery(first).queryKey, emptyPages);
  client.setQueryData(answersQuery(second).queryKey, emptyPages);
});

const render = <T,>(hook: () => T) =>
  renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

const stale = (queryKey: readonly unknown[]) =>
  client.getQueryState(queryKey)?.isInvalidated;

describe('question mutations', () => {
  it('should reload the questions after asking, and leave the lesson alone', async () => {
    const ask = vi.spyOn(QuestionService, 'ask').mockResolvedValue({} as never);
    const { result } = render(() => useAskQuestion(lesson));

    act(() => {
      result.current.mutate('Why?');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(ask).toHaveBeenCalledWith(lesson, 'Why?');
    expect(stale(questionsQuery(lesson).queryKey)).toBe(true);
    expect(stale(answersQuery(first).queryKey)).toBe(false);
    expect(stale(lessonQuery('c1', 'l1').queryKey)).toBe(false);
  });

  it('should reload the answers of that question and the count, after an answer', async () => {
    vi.spyOn(QuestionService, 'answer').mockResolvedValue({} as never);
    const { result } = render(() => useAnswerQuestion(first));

    act(() => {
      result.current.mutate('Because.');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(stale(answersQuery(first).queryKey)).toBe(true);
    expect(stale(questionsQuery(lesson).queryKey)).toBe(true);
    expect(stale(answersQuery(second).queryKey)).toBe(false);
  });

  it('should reload the list after a refusal, and the outline when the course was archived', async () => {
    vi.spyOn(QuestionService, 'answer').mockRejectedValue(
      apiError(409, 'COURSE_ARCHIVED'),
    );
    const { result } = render(() => useAnswerQuestion(first));

    act(() => {
      result.current.mutate('Because.');
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(stale(questionsQuery(lesson).queryKey)).toBe(true);
    expect(stale(outlineQuery('c1').queryKey)).toBe(true);
  });

  it('should leave the outline alone after any other refusal', async () => {
    vi.spyOn(QuestionService, 'answer').mockRejectedValue(
      apiError(409, 'QUESTION_REMOVED'),
    );
    const { result } = render(() => useAnswerQuestion(first));

    act(() => {
      result.current.mutate('Because.');
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(stale(questionsQuery(lesson).queryKey)).toBe(true);
    expect(stale(outlineQuery('c1').queryKey)).toBe(false);
  });

  it('should reload every question of the lesson after deleting one', async () => {
    const remove = vi.spyOn(QuestionService, 'remove').mockResolvedValue();
    const { result } = render(() => useDeleteQuestion(lesson));

    act(() => {
      result.current.mutate('q1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(remove).toHaveBeenCalledWith(first);
    expect(stale(questionsQuery(lesson).queryKey)).toBe(true);
    expect(stale(answersQuery(second).queryKey)).toBe(true);
    expect(stale(lessonQuery('c1', 'l1').queryKey)).toBe(false);
  });

  it('should reload the answers of that question and the list, after deleting an answer', async () => {
    const removeAnswer = vi
      .spyOn(QuestionService, 'removeAnswer')
      .mockResolvedValue();
    const { result } = render(() => useDeleteAnswer(first));

    act(() => {
      result.current.mutate('a1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(removeAnswer).toHaveBeenCalledWith(first, 'a1');
    expect(stale(answersQuery(first).queryKey)).toBe(true);
    expect(stale(questionsQuery(lesson).queryKey)).toBe(true);
    expect(stale(answersQuery(second).queryKey)).toBe(false);
  });
});
