import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { QuestionFailure } from '~/components/questions/QuestionFailure';
import { apiError } from '~/test/renderRoutes';

const throttled = new AxiosError('Too Many Requests', '429', undefined, null, {
  data: { message: 'Too Many Requests' },
  status: 429,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() },
});

describe('QuestionFailure', () => {
  it('should tell the refusals of an out-of-date screen apart', () => {
    expect(QuestionFailure.isStale(apiError(409, 'QUESTION_REMOVED'))).toBe(
      true,
    );
    expect(QuestionFailure.isStale(apiError(409, 'COURSE_ARCHIVED'))).toBe(
      true,
    );
    expect(QuestionFailure.isStale(apiError(400, 'VALIDATION'))).toBe(false);
    expect(QuestionFailure.isStale(throttled)).toBe(false);
  });

  it('should explain each refusal', () => {
    expect(QuestionFailure.message(apiError(409, 'QUESTION_REMOVED'))).toBe(
      'A pergunta foi removida enquanto você respondia. A lista foi atualizada.',
    );
    expect(QuestionFailure.message(throttled)).toBe(
      'Muitos envios seguidos. Espere um instante e tente de novo.',
    );
    expect(QuestionFailure.message(apiError(500, 'INTERNAL'))).toBe(
      'Não foi possível concluir. Tente de novo.',
    );
  });
});
