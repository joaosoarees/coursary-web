import { IMAGE_TYPES, ImageFile } from '~/lib/imageFile';

export const COVER_TYPES = IMAGE_TYPES;

export const COVER_HINT =
  'JPEG, PNG ou WebP, até 10 MB. Mostrada em 16:9, sem cortes.';

export const checkCover = (file: File) =>
  ImageFile.check(file, {
    maxBytes: 10 * 1024 * 1024,
    tooBig: 'Escolha uma imagem de até 10 MB.',
  });
