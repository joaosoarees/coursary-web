import { describe, expect, it } from 'vitest';

import { AVATAR_MAX_BYTES, avatarProblem } from '~/account/avatarRules';

const fileOf = (type: string, size: number) =>
  new File([new Uint8Array(size)], 'foto', { type });

describe('avatarProblem', () => {
  it('should accept JPEG, PNG and WebP up to 5 MB', () => {
    expect(avatarProblem(fileOf('image/jpeg', 10))).toBeUndefined();
    expect(
      avatarProblem(fileOf('image/webp', AVATAR_MAX_BYTES)),
    ).toBeUndefined();
  });

  it('should refuse another type and a larger file', () => {
    expect(avatarProblem(fileOf('image/gif', 10))).toBe(
      'Escolha uma imagem JPEG, PNG ou WebP.',
    );
    expect(avatarProblem(fileOf('image/png', AVATAR_MAX_BYTES + 1))).toBe(
      'Escolha uma imagem de até 5 MB.',
    );
  });
});
