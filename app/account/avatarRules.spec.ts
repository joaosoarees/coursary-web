import { describe, expect, it } from 'vitest';

import { AVATAR_MAX_BYTES, checkAvatar } from '~/account/avatarRules';

const fileOf = (head: number[], size = head.length, type = 'image/png') => {
  const bytes = new Uint8Array(size);
  bytes.set(head);

  return new File([bytes], 'foto.png', { type });
};

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const WEBP = Array.from(new TextEncoder().encode('RIFF\0\0\0\0WEBP'));
const GIF = Array.from(new TextEncoder().encode('GIF89a'));

describe('checkAvatar', () => {
  it('should read JPEG, PNG and WebP from their bytes up to 5 MB', async () => {
    await expect(checkAvatar(fileOf(PNG))).resolves.toEqual({
      type: 'image/png',
    });
    await expect(checkAvatar(fileOf(WEBP, AVATAR_MAX_BYTES))).resolves.toEqual({
      type: 'image/webp',
    });
  });

  it('should trust the bytes over the name', async () => {
    await expect(checkAvatar(fileOf(JPEG))).resolves.toEqual({
      type: 'image/jpeg',
    });
  });

  it('should refuse another format and a larger file', async () => {
    await expect(checkAvatar(fileOf(GIF, 10, 'image/gif'))).resolves.toEqual({
      problem: 'Escolha uma imagem JPEG, PNG ou WebP.',
    });
    await expect(
      checkAvatar(fileOf(PNG, AVATAR_MAX_BYTES + 1)),
    ).resolves.toEqual({ problem: 'Escolha uma imagem de até 5 MB.' });
  });

  it('should say so when the file can no longer be read', async () => {
    const gone = fileOf(PNG);
    gone.slice = () =>
      ({
        arrayBuffer: () =>
          Promise.reject(new DOMException('', 'NotReadableError')),
      }) as unknown as Blob;

    await expect(checkAvatar(gone)).resolves.toEqual({
      problem: 'Não deu para ler a imagem. Escolha de novo.',
    });
  });
});
