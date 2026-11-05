export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

export class ImageFile {
  static async check(
    file: File,
    { maxBytes, tooBig }: { maxBytes: number; tooBig: string },
  ): Promise<{ type: string } | { problem: string }> {
    if (file.size > maxBytes) {
      return { problem: tooBig };
    }

    let head: Uint8Array;

    try {
      head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    } catch {
      return { problem: 'Não deu para ler a imagem. Escolha de novo.' };
    }

    const type = typeOfBytes(head);

    return type
      ? { type }
      : { problem: 'Escolha uma imagem JPEG, PNG ou WebP.' };
  }
}
