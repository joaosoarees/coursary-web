import { z } from 'zod';

import { lessonUrl } from '~/services/apiPaths';
import { httpClient } from '~/services/httpClient';

const questionSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  text: z.string(),
  createdAt: z.string(),
  answerCount: z.number(),
  removed: z.boolean(),
  canDelete: z.boolean(),
});

const answerSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  text: z.string(),
  createdAt: z.string(),
  byInstructor: z.boolean(),
  canDelete: z.boolean(),
});

const questionsPageSchema = z.object({
  items: z.array(questionSchema),
  nextCursor: z.string().nullable(),
});

const answersPageSchema = z.object({
  items: z.array(answerSchema),
  nextCursor: z.string().nullable(),
});

export type Question = z.infer<typeof questionSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type QuestionsPage = z.infer<typeof questionsPageSchema>;
export type AnswersPage = z.infer<typeof answersPageSchema>;

export interface LessonRef {
  courseId: string;
  lessonId: string;
}

export interface QuestionRef extends LessonRef {
  questionId: string;
}

interface PageRequest {
  cursor: string | undefined;
  limit: number;
}

const questionsUrl = ({ courseId, lessonId }: LessonRef) =>
  `${lessonUrl(courseId, lessonId)}/questions`;

const questionUrl = ({ questionId, ...lesson }: QuestionRef) =>
  `${questionsUrl(lesson)}/${encodeURIComponent(questionId)}`;

export class QuestionService {
  static async list(
    lesson: LessonRef,
    { cursor, limit }: PageRequest,
    signal?: AbortSignal,
  ): Promise<QuestionsPage> {
    const { data } = await httpClient.get<unknown>(questionsUrl(lesson), {
      params: { cursor, limit },
      signal,
    });

    return questionsPageSchema.parse(data);
  }

  static async ask(lesson: LessonRef, text: string): Promise<Question> {
    const { data } = await httpClient.post<unknown>(questionsUrl(lesson), {
      text,
    });

    return questionSchema.parse(data);
  }

  static async remove(question: QuestionRef): Promise<void> {
    await httpClient.delete(questionUrl(question));
  }

  static async answers(
    question: QuestionRef,
    { cursor, limit }: PageRequest,
    signal?: AbortSignal,
  ): Promise<AnswersPage> {
    const { data } = await httpClient.get<unknown>(
      `${questionUrl(question)}/answers`,
      { params: { cursor, limit }, signal },
    );

    return answersPageSchema.parse(data);
  }

  static async answer(question: QuestionRef, text: string): Promise<Answer> {
    const { data } = await httpClient.post<unknown>(
      `${questionUrl(question)}/answers`,
      { text },
    );

    return answerSchema.parse(data);
  }

  static async removeAnswer(
    question: QuestionRef,
    answerId: string,
  ): Promise<void> {
    await httpClient.delete(
      `${questionUrl(question)}/answers/${encodeURIComponent(answerId)}`,
    );
  }
}
