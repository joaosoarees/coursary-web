import { describe, expect, it } from 'vitest';

import { checkVideo, VIDEO_MAX_BYTES } from '~/instructor/lesson/videoRules';

const sized = (file: File, size: number) =>
  Object.defineProperty(file, 'size', { value: size });

describe('checkVideo', () => {
  it('should take an MP4, even one the browser gave no type', () => {
    expect(
      checkVideo(new File(['x'], 'aula.mp4', { type: 'video/mp4' })),
    ).toBeUndefined();
    expect(checkVideo(new File(['x'], 'AULA.MP4'))).toBeUndefined();
  });

  it('should refuse another type, a file over 2 GB and an empty one', () => {
    expect(
      checkVideo(new File(['x'], 'aula.mov', { type: 'video/quicktime' })),
    ).toEqual({ problem: 'Envie um arquivo MP4.' });
    expect(
      checkVideo(
        sized(
          new File([''], 'aula.mp4', { type: 'video/mp4' }),
          VIDEO_MAX_BYTES + 1,
        ),
      ),
    ).toEqual({ problem: 'O vídeo passa de 2 GB.' });
    expect(checkVideo(new File([], 'aula.mp4', { type: 'video/mp4' }))).toEqual(
      { problem: 'O arquivo está vazio. Escolha outro vídeo.' },
    );
  });
});
