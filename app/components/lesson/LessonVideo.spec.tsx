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
const setPlayback = (
  player: HTMLVideoElement,
  { seconds, paused }: { seconds: number; paused: boolean },
) => {
  Object.defineProperty(player, 'currentTime', {
    configurable: true,
    writable: true,
    value: seconds,
  });
  Object.defineProperty(player, 'paused', {
    configurable: true,
    value: paused,
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

  it('should offer to try again when the new address fails too', () => {
    const { onExpired, player } = renderVideo();

    fireEvent.error(player);
    fireEvent.error(player);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o vídeo',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(onExpired).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('should bring the player back when a new address arrives', () => {
    const { onExpired, player, view } = renderVideo();
    fireEvent.error(player);
    fireEvent.error(player);

    view.rerender(
      <LessonVideo
        title="Filtrando e agrupando"
        video={video('https://files.test/b.mp4')}
        onExpired={onExpired}
      />,
    );

    expect(screen.queryByRole('alert')).toBeNull();
    expect(player).toBeVisible();
  });

  it('should go back to the same second and keep playing with the new address', () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const { player, view, onExpired } = renderVideo();
    setPlayback(player, { seconds: 252, paused: false });

    fireEvent.error(player);
    expect(onExpired).toHaveBeenCalledTimes(1);

    view.rerender(
      <LessonVideo
        title="Filtrando e agrupando"
        video={video('https://files.test/b.mp4')}
        onExpired={onExpired}
      />,
    );
    // Swapping the source resets the time and pauses before the new one loads.
    setPlayback(player, { seconds: 0, paused: true });
    fireEvent.loadedMetadata(player);

    expect(player).toHaveAttribute('src', 'https://files.test/b.mp4');
    expect(player.currentTime).toBe(252);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('should stay paused after the swap when the reader had paused', () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const { player } = renderVideo('https://files.test/a.mp4', 600);
    setPlayback(player, { seconds: 90, paused: true });

    act(() => {
      vi.advanceTimersByTime(540_000);
    });
    setPlayback(player, { seconds: 0, paused: true });
    fireEvent.loadedMetadata(player);

    expect(player.currentTime).toBe(90);
    expect(play).not.toHaveBeenCalled();
  });

  it('should start from the beginning on the first load', () => {
    const { player } = renderVideo();
    setPlayback(player, { seconds: 0, paused: true });

    fireEvent.loadedMetadata(player);

    expect(player.currentTime).toBe(0);
  });
});
