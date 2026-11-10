import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '~/services/httpClient';
import { QuestionService } from '~/services/QuestionService';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown, status = 200) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

const lesson = { courseId: 'c1', lessonId: 'l1' };
const ref = { ...lesson, questionId: 'q1' };

// As QuestionSummary and AnswerSummary of the API send them.
const question = {
  id: 'q1',
  authorName: 'Duda',
  text: 'Why?',
  createdAt: '2026-11-10T12:00:00.000Z',
  answerCount: 0,
  removed: false,
  canDelete: true,
};
const reply = {
  id: 'a1',
  authorName: 'Ana',
  text: 'Because.',
  createdAt: '2026-11-10T12:05:00.000Z',
  byInstructor: true,
  canDelete: false,
};

const lastCall = () => adapter.mock.calls.at(-1)?.[0];

describe('QuestionService', () => {
  it('should read a page of the lesson questions', async () => {
    answer({ items: [question], nextCursor: 'next' });

    await expect(
      QuestionService.list(lesson, { cursor: 'abc', limit: 10 }),
    ).resolves.toEqual({ items: [question], nextCursor: 'next' });
    expect(lastCall()).toMatchObject({
      method: 'get',
      url: '/courses/c1/lessons/l1/questions',
      params: { cursor: 'abc', limit: 10 },
    });
  });

  it('should ask a question with its text', async () => {
    answer(question, 201);

    await expect(QuestionService.ask(lesson, 'Why?')).resolves.toEqual(
      question,
    );
    expect(lastCall()).toMatchObject({
      method: 'post',
      url: '/courses/c1/lessons/l1/questions',
      data: JSON.stringify({ text: 'Why?' }),
    });
  });

  it('should delete a question', async () => {
    answer(undefined, 204);

    await QuestionService.remove(ref);

    expect(lastCall()).toMatchObject({
      method: 'delete',
      url: '/courses/c1/lessons/l1/questions/q1',
    });
  });

  it('should read a page of the answers', async () => {
    answer({ items: [reply], nextCursor: null });

    await expect(
      QuestionService.answers(ref, { cursor: undefined, limit: 20 }),
    ).resolves.toEqual({ items: [reply], nextCursor: null });
    expect(lastCall()).toMatchObject({
      method: 'get',
      url: '/courses/c1/lessons/l1/questions/q1/answers',
      params: { limit: 20 },
    });
  });

  it('should answer a question with its text', async () => {
    answer(reply, 201);

    await expect(QuestionService.answer(ref, 'Because.')).resolves.toEqual(
      reply,
    );
    expect(lastCall()).toMatchObject({
      method: 'post',
      url: '/courses/c1/lessons/l1/questions/q1/answers',
      data: JSON.stringify({ text: 'Because.' }),
    });
  });

  it('should delete an answer', async () => {
    answer(undefined, 204);

    await QuestionService.removeAnswer(ref, 'a1');

    expect(lastCall()).toMatchObject({
      method: 'delete',
      url: '/courses/c1/lessons/l1/questions/q1/answers/a1',
    });
  });

  it('should refuse an answer that is not a question', async () => {
    answer({ id: 'q1' }, 201);

    await expect(QuestionService.ask(lesson, 'Why?')).rejects.toThrow();
  });
});
