import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { ApiFailure } from '~/services/ApiFailure';

const answered = (status: number, data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

const unanswered = () => new AxiosError('Network Error', 'ERR_NETWORK');

const invalidCode = answered(400, {
  error: { code: 'INVALID_CODE', message: 'The code is wrong.' },
});

describe('ApiFailure.codeOf', () => {
  it("should read the code from the API's error body", () => {
    expect(ApiFailure.codeOf(invalidCode)).toBe('INVALID_CODE');
  });

  it('should have no code for a body in another shape', () => {
    expect(ApiFailure.codeOf(answered(502, '<html>'))).toBeUndefined();
    expect(ApiFailure.codeOf(unanswered())).toBeUndefined();
    expect(ApiFailure.codeOf(new ZodError([]))).toBeUndefined();
  });
});

describe('ApiFailure.message', () => {
  it("should show the page's sentence for a code it expects", () => {
    expect(
      ApiFailure.message(invalidCode, { INVALID_CODE: 'Código errado.' }),
    ).toBe('Código errado.');
  });

  it('should never show the English message of the API', () => {
    expect(ApiFailure.message(invalidCode)).toBe(
      'Não foi possível concluir. Tente de novo.',
    );
  });

  it('should tell a request that got no answer apart', () => {
    expect(ApiFailure.message(unanswered())).toBe(
      'Não foi possível falar com o servidor. Confira a conexão.',
    );
  });

  it('should fall back for anything that is not a request error', () => {
    expect(ApiFailure.message(new Error('boom'))).toBe(
      'Não foi possível concluir. Tente de novo.',
    );
  });
});
