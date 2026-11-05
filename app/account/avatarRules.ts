import { IMAGE_TYPES, ImageFile } from '~/lib/imageFile';

export const AVATAR_TYPES = IMAGE_TYPES;

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_HINT =
  'JPEG, PNG ou WebP, até 5 MB. A foto é recortada em quadrado.';

export const checkAvatar = (file: File) =>
  ImageFile.check(file, {
    maxBytes: AVATAR_MAX_BYTES,
    tooBig: 'Escolha uma imagem de até 5 MB.',
  });
