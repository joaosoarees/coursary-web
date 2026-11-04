import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LessonVideo } from '~/components/lesson/LessonVideo';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const video = (url: string, expiresIn = 7200) => ({ url, expiresIn });

const renderVideo = (url = 'https://files.test/a.mp4', expiresIn = 7200) => {
  const onExpired = vi.fn();
  const view = render(
    <LessonVideo
      title="Filtrando e agrupando"
      video={video(url, expiresIn)}
      onExpired={onExpired}
    />,
  );
  const player = screen.getByLabelText<HTMLVideoElement>(
    'Vídeo da aula Filtrando e agrupando',
  );

  return { onExpired, player, view };
};

// jsdom keeps no playback position, so the test plays the browser's part.
const setTime = (player: HTMLVideoElement, seconds: number) => {
  Object.defineProperty(player, 'currentTime', {
    configurable: true,
    writable: true,
    value: seconds,
  });
};

describe('LessonVideo', () => {
  it('should ask for a new address a minute before the old one expires', () => {
    const { onExpired } = renderVideo('https://files.test/a.mp4', 600);

    act(() => {
      vi.advanceTimersByTime(539_000);
    });
    expect(onExpired).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('should ask once for a new address when the video fails to load', () => {
    const { onExpired, player } = renderVideo();

    fireEvent.error(player);
    fireEvent.error(player);

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('should go back to the same second and keep playing with the new address', () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const { player, view, onExpired } = renderVideo();
    setTime(player, 252);
    fireEvent.play(player);
    fireEvent.timeUpdate(player);

    view.rerender(
      <LessonVideo
        title="Filtrando e agrupando"
        video={video('https://files.test/b.mp4')}
        onExpired={onExpired}
      />,
    );
    setTime(player, 0);
    fireEvent.loadedMetadata(player);

    expect(player).toHaveAttribute('src', 'https://files.test/b.mp4');
    expect(player.currentTime).toBe(252);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('should stay paused after the swap when the reader had paused', () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const { player } = renderVideo();
    setTime(player, 90);
    fireEvent.play(player);
    fireEvent.timeUpdate(player);
    fireEvent.pause(player);

    fireEvent.loadedMetadata(player);

    expect(player.currentTime).toBe(90);
    expect(play).not.toHaveBeenCalled();
  });
});
