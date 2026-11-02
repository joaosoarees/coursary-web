import { describe, expect, it } from 'vitest';

import {
  confirmSignUpSchema,
  PASSWORD_RULE,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '~/auth/authSchemas';

const firstMessage = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('signUpSchema', () => {
  const valid = {
    name: '  Ana Souza ',
    email: ' ana.souza@exemplo.com ',
    password: 'violao2026',
  };

  it('should trim what it sends', () => {
    expect(signUpSchema.parse(valid)).toEqual({
      name: 'Ana Souza',
      email: 'ana.souza@exemplo.com',
      password: 'violao2026',
    });
  });

  it.each([
    ['violao', 'too short'],
    ['violaoviolao', 'without a number'],
    ['VIOLAO2026', 'without a lowercase letter'],
  ])('should refuse the password %s, %s, with the rule', (password) => {
    expect(firstMessage(signUpSchema.safeParse({ ...valid, password }))).toBe(
      PASSWORD_RULE,
    );
  });

  it('should refuse a name of spaces', () => {
    expect(
      firstMessage(signUpSchema.safeParse({ ...valid, name: '   ' })),
    ).toBe('Informe o seu nome.');
  });

  it('should refuse an incomplete e-mail', () => {
    expect(
      firstMessage(signUpSchema.safeParse({ ...valid, email: 'ana@exemplo' })),
    ).toBe('Informe um e-mail completo, como nome@exemplo.com.');
  });
});

describe('signInSchema', () => {
  it('should only ask that a password was typed', () => {
    expect(
      signInSchema.safeParse({ email: 'ana@exemplo.com', password: 'x' })
        .success,
    ).toBe(true);
    expect(
      firstMessage(
        signInSchema.safeParse({ email: 'ana@exemplo.com', password: '' }),
      ),
    ).toBe('Informe a senha.');
  });
});

describe('codes', () => {
  it('should refuse an empty code and one with spaces', () => {
    expect(
      firstMessage(
        confirmSignUpSchema.safeParse({ email: 'ana@exemplo.com', code: ' ' }),
      ),
    ).toBe('Informe o código do e-mail.');
    expect(
      firstMessage(
        resetPasswordSchema.safeParse({
          email: 'ana@exemplo.com',
          code: '48 2913',
          newPassword: 'violao2026',
        }),
      ),
    ).toBe('O código não tem espaços.');
  });
});
