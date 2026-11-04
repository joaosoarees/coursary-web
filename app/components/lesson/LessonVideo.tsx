import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { ErrorState } from '~/components/ErrorState';
import { cn } from '~/lib/utils';
import type { SignedUrl } from '~/services/LessonService';

// The signed address may die before its expiresIn, with the session of the role that signed it,
// so a fresh one is asked for a minute early, and once more when the player fails to load.
const RENEW_EARLY_SECONDS = 60;
const RENEW_AT_LEAST_AFTER_SECONDS = 30;
const SAVE_EVERY_MS = 20_000;
// Too close to the end to be worth resuming: the student would land on the credits.
const NEAR_END_SECONDS = 10;

interface Resume {
  seconds: number;
  playing: boolean;
}

export function LessonVideo({
  title,
  video,
  startAt,
  onExpired,
  onPosition,
  onEnded,
}: {
  title: string;
  video: SignedUrl;
  startAt?: number;
  onExpired: () => void;
  onPosition?: (seconds: number, leaving: boolean) => void;
  onEnded?: () => void;
}) {
  const element = useRef<HTMLVideoElement>(null);
  const resume = useRef<Resume | null>(
    startAt ? { seconds: startAt, playing: false } : null,
  );
  const failedLoads = useRef(0);
  const lastTime = useRef(startAt ?? 0);
  const lastSent = useRef<number | null>(null);
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

  function report(leaving = false) {
    const seconds = Math.floor(lastTime.current);

    if (lastSent.current === seconds) {
      return;
    }

    lastSent.current = seconds;
    onPosition?.(seconds, leaving);
  }

  const reportOnTime = useEffectEvent(report);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (element.current && !element.current.paused) {
        reportOnTime();
      }
    }, SAVE_EVERY_MS);
    const leave = () => {
      reportOnTime(true);
    };
    const hide = () => {
      if (document.visibilityState === 'hidden') {
        leave();
      }
    };

    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', leave);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('pagehide', leave);
      // Moving to another lesson unmounts the player without a pause event.
      reportOnTime();
    };
  }, []);

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

    if (
      !player ||
      !saved ||
      saved.seconds >= player.duration - NEAR_END_SECONDS
    ) {
      return;
    }

    player.currentTime = saved.seconds;
    lastTime.current = saved.seconds;

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
          'mx-auto block aspect-video max-h-[70vh] w-full max-w-[calc(70vh*16/9)] bg-black',
          failed && 'hidden',
        )}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        // While a new address loads, the reset time and the pause belong to the swap, not the student.
        onTimeUpdate={(event) => {
          if (!resume.current) {
            lastTime.current = event.currentTarget.currentTime;
          }
        }}
        onPause={() => {
          if (!resume.current) {
            report();
          }
        }}
        onEnded={(event) => {
          lastTime.current = event.currentTarget.duration;
          report();
          onEnded?.();
        }}
      />
    </>
  );
}
