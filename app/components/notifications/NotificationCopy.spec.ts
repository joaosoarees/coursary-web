import { describe, expect, it } from 'vitest';

import { NotificationCopy } from '~/components/notifications/NotificationCopy';
import type { Notification } from '~/services/NotificationService';

const base: Notification = {
  id: 'n1',
  kind: 'answer',
  courseId: 'c1',
  courseTitle: 'Python para análise de dados',
  lessonId: 'l1',
  lessonTitle: 'Filtrando e agrupando',
  questionId: 'q1',
  actorName: 'Marina Costa',
  byInstructor: true,
  read: false,
  createdAt: '2026-11-12T12:00:00.000Z',
};

const sentence = (notification: Notification) =>
  NotificationCopy.runs(notification)
    .map(({ text, strong }) => (strong ? `*${text}*` : text))
    .join('');

describe('NotificationCopy', () => {
  it.each([
    [
      'answer',
      'Marina Costa respondeu à sua pergunta em *Filtrando e agrupando*',
    ],
    [
      'question',
      'Marina Costa perguntou em *Filtrando e agrupando* (*Python para análise de dados*)',
    ],
    [
      'lesson',
      'Aula nova em *Python para análise de dados*: *Filtrando e agrupando*',
    ],
    ['archived', '*Python para análise de dados* foi arquivado'],
  ] as const)('should write the %s notice', (kind, expected) => {
    expect(sentence({ ...base, kind })).toBe(expected);
  });

  it.each([
    ['answer', '/cursos/c1/aulas/l1#perguntas-l1'],
    ['question', '/instrutor/cursos/c1/aulas/l1/previa#perguntas-l1'],
    ['lesson', '/cursos/c1/aulas/l1'],
    ['archived', '/minhas-matriculas'],
  ] as const)('should lead the %s notice to %s', (kind, path) => {
    expect(NotificationCopy.target({ ...base, kind })).toBe(path);
  });

  it.each([
    [0, 'Notificações', '0'],
    [1, 'Notificações, 1 não lida', '1'],
    [3, 'Notificações, 3 não lidas', '3'],
    [99, 'Notificações, 99 não lidas', '99'],
    [100, 'Notificações, mais de 99 não lidas', '99+'],
  ])('should name %i unread as "%s" with "%s"', (count, label, badge) => {
    expect(NotificationCopy.unreadLabel(count)).toBe(label);
    expect(NotificationCopy.badge(count)).toBe(badge);
  });
});
