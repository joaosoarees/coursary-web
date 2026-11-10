import { isAxiosError } from 'axios';

import { ApiFailure } from '~/services/ApiFailure';

// Refusals that mean the screen was out of date; the mutation already reloaded it.
const STALE: Partial<Record<string, string>> = {
  COURSE_ARCHIVED:
    'O curso foi arquivado: as perguntas ficaram só para leitura.',
  QUESTION_REMOVED:
    'A pergunta foi removida enquanto você respondia. A lista foi atualizada.',
  QUESTION_NOT_FOUND: 'A pergunta não existe mais. A lista foi atualizada.',
  ANSWER_NOT_FOUND: 'A resposta não existe mais. A lista foi atualizada.',
  CONFLICT:
    'A conversa mudou enquanto você agia. A lista foi atualizada; confira e tente de novo.',
};

// API Gateway's throttle answers 429 with a body of its own, not the API's error shape.
const THROTTLED = 'Muitos envios seguidos. Espere um instante e tente de novo.';

export class QuestionFailure {
  static isStale(error: unknown): boolean {
    const code = ApiFailure.codeOf(error);

    return code !== undefined && STALE[code] !== undefined;
  }

  static message(error: unknown): string {
    if (isAxiosError(error) && error.response?.status === 429) {
      return THROTTLED;
    }

    return ApiFailure.message(error, STALE);
  }
}
