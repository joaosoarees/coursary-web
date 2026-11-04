import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { ErrorState } from '~/components/ErrorState';
import { cn } from '~/lib/utils';
import type { SignedUrl } from '~/services/LessonService';

// The signed address may die before its expiresIn, with the session of the role that signed it,
// so a fresh one is asked for a minute early, and once more when the player fails to load.
const RENEW_EARLY_SECONDS = 60;
const RENEW_AT_LEAST_AFTER_SECONDS = 30;

interface Resume {
  seconds: number;
  playing: boolean;
}

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
  const resume = useRef<Resume | null>(null);
  const failedLoads = useRef(0);
  // Tied to the address that failed, so a new one brings the player back on its own.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = failedUrl === video.url;

  // Read before the new address arrives: swapping the source resets the time and pauses.
  function renew() {
    const player = element.current;

    if (player) {
      resume.current = { seconds: player.currentTime, playing: !player.paused };
    }

    onExpired();
  }

  const renewOnTime = useEffectEvent(renew);

  useEffect(() => {
    const seconds = Math.max(
      video.expiresIn - RENEW_EARLY_SECONDS,
      RENEW_AT_LEAST_AFTER_SECONDS,
    );
    const timer = window.setTimeout(renewOnTime, seconds * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [video.url, video.expiresIn]);

  // A second failure in a row is not an expired address, so the reader gets the choice to retry.
  function handleError() {
    failedLoads.current += 1;

    if (failedLoads.current === 1) {
      renew();
    } else {
      setFailedUrl(video.url);
    }
  }

  function retry() {
    failedLoads.current = 0;
    setFailedUrl(null);
    renew();
  }

  function handleLoadedMetadata() {
    failedLoads.current = 0;
    const player = element.current;
    const saved = resume.current;
    resume.current = null;

    if (!player || !saved) {
      return;
    }

    player.currentTime = saved.seconds;

    if (saved.playing) {
      void player.play().catch(() => undefined);
    }
  }

  return (
    <>
      {failed && (
        <ErrorState
          variant="block"
          title="Não foi possível carregar o vídeo"
          message="O texto e o material da aula continuam abaixo."
          onRetry={retry}
        />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the API stores no captions for a lesson. */}
      <video
        ref={element}
        src={video.url}
        controls
        playsInline
        preload="metadata"
        aria-label={`Vídeo da aula ${title}`}
        className={cn(
          'aspect-video w-full rounded-md bg-black',
          failed && 'hidden',
        )}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
      />
    </>
  );
}
