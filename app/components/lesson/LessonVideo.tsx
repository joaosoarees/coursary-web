import { useEffect, useRef } from 'react';

import type { SignedUrl } from '~/services/LessonService';

// The signed address may die before its expiresIn, with the session of the role that signed it,
// so a fresh one is asked for a minute early, and once more when the player fails to load.
const RENEW_EARLY_SECONDS = 60;
const RENEW_AT_LEAST_AFTER_SECONDS = 30;

export function LessonVideo({
  title,
  video,
  onExpired,
}: {
  title: string;
  video: SignedUrl;
  onExpired: () => void;
}) {
  const element = useRef<HTMLVideoElement>(null);
  const resumeAt = useRef(0);
  const wasPlaying = useRef(false);
  const failedLoads = useRef(0);

  useEffect(() => {
    const seconds = Math.max(
      video.expiresIn - RENEW_EARLY_SECONDS,
      RENEW_AT_LEAST_AFTER_SECONDS,
    );
    const timer = window.setTimeout(onExpired, seconds * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [video.url, video.expiresIn, onExpired]);

  function handleLoadedMetadata() {
    failedLoads.current = 0;
    const player = element.current;

    if (!player || resumeAt.current === 0) {
      return;
    }

    player.currentTime = resumeAt.current;

    if (wasPlaying.current) {
      void player.play().catch(() => undefined);
    }
  }

  // A second failure in a row is not an expired address: the native player shows its own error.
  function handleError() {
    failedLoads.current += 1;

    if (failedLoads.current === 1) {
      onExpired();
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- the API stores no captions for a lesson.
    <video
      ref={element}
      src={video.url}
      controls
      playsInline
      preload="metadata"
      aria-label={`Vídeo da aula ${title}`}
      className="aspect-video w-full rounded-md bg-black"
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={(event) => {
        resumeAt.current = event.currentTarget.currentTime;
      }}
      onPlay={() => {
        wasPlaying.current = true;
      }}
      onPause={() => {
        wasPlaying.current = false;
      }}
      onError={handleError}
    />
  );
}
