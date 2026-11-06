export const VIDEO_TYPE = 'video/mp4';

export const VIDEO_ACCEPT = `${VIDEO_TYPE},.mp4`;

export const VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const VIDEO_HINT =
  'MP4, até 2 GB. Vai em partes: um arquivo grande leva alguns minutos, e a página precisa ficar aberta.';

// The extension decides when the browser leaves File.type empty; the API checks the type it is told.
export const checkVideo = (file: File): { problem: string } | undefined => {
  const mp4 =
    file.type === VIDEO_TYPE ||
    (file.type === '' && file.name.toLowerCase().endsWith('.mp4'));

  if (!mp4) {
    return { problem: 'Envie um arquivo MP4.' };
  }

  if (file.size > VIDEO_MAX_BYTES) {
    return { problem: 'O vídeo passa de 2 GB.' };
  }

  if (file.size === 0) {
    return { problem: 'O arquivo está vazio. Escolha outro vídeo.' };
  }

  return undefined;
};
