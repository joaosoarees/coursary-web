export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_HINT =
  'JPEG, PNG ou WebP, até 5 MB. A foto é recortada em quadrado.';

const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

const startsWith = (bytes: Uint8Array, prefix: number[], offset = 0) =>
  prefix.every((byte, index) => bytes[offset + index] === byte);

// The browser takes File.type from the extension, and the API checks the bytes: a JPEG saved as
// .png was refused after the upload, with nothing telling the person why.
const typeOfBytes = (bytes: Uint8Array): string | undefined => {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) {
    return 'image/webp';
  }

  return undefined;
};

export const checkAvatar = async (
  file: File,
): Promise<{ type: string } | { problem: string }> => {
  if (file.size > AVATAR_MAX_BYTES) {
    return { problem: 'Escolha uma imagem de até 5 MB.' };
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const type = typeOfBytes(head);

  return type ? { type } : { problem: 'Escolha uma imagem JPEG, PNG ou WebP.' };
};
