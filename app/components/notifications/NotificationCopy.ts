import type { Notification } from '~/services/NotificationService';

// A sentence in runs: the names are set in bold, the rest is plain.
export interface Run {
  text: string;
  strong: boolean;
}

const plain = (text: string): Run => ({ text, strong: false });
const strong = (text: string): Run => ({ text, strong: true });

const lessonPath = ({ courseId, lessonId = '' }: Notification) =>
  `/cursos/${courseId}/aulas/${lessonId}`;

export class NotificationCopy {
  static runs(notification: Notification): Run[] {
    const {
      actorName = 'Alguém',
      lessonTitle = '',
      courseTitle,
    } = notification;

    switch (notification.kind) {
      case 'answer':
        return [
          plain(`${actorName} respondeu à sua pergunta em `),
          strong(lessonTitle),
        ];
      case 'question':
        return [
          plain(`${actorName} perguntou em `),
          strong(lessonTitle),
          plain(' ('),
          strong(courseTitle),
          plain(')'),
        ];
      case 'lesson':
        return [
          plain('Aula nova em '),
          strong(courseTitle),
          plain(': '),
          strong(lessonTitle),
        ];
      case 'archived':
        return [strong(courseTitle), plain(' foi arquivado')];
    }
  }

  // The owner answers from the preview; an archived course has no page, only the enrollments.
  static target(notification: Notification): string {
    const questions = `#perguntas-${notification.lessonId ?? ''}`;

    switch (notification.kind) {
      case 'answer':
        return `${lessonPath(notification)}${questions}`;
      case 'question':
        return `/instrutor${lessonPath(notification)}/previa${questions}`;
      case 'lesson':
        return lessonPath(notification);
      case 'archived':
        return '/minhas-matriculas';
    }
  }

  static unreadLabel(count: number): string {
    if (count >= 100) {
      return 'Notificações, mais de 99 não lidas';
    }

    if (count === 0) {
      return 'Notificações';
    }

    return `Notificações, ${String(count)} ${count === 1 ? 'não lida' : 'não lidas'}`;
  }

  static badge(count: number): string {
    return count >= 100 ? '99+' : String(count);
  }
}
