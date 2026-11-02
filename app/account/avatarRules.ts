export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_HINT =
  'JPEG, PNG ou WebP, até 5 MB. A foto é recortada em quadrado.';

export const avatarProblem = (file: File): string | undefined => {
  if (!AVATAR_TYPES.includes(file.type)) {
    return 'Escolha uma imagem JPEG, PNG ou WebP.';
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return 'Escolha uma imagem de até 5 MB.';
  }

  return undefined;
};
