import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '~/auth/useAuth';
import {
  type LessonWatcher,
  type Realtime,
  realtimeChangeSchema,
  RealtimeContext,
} from '~/hooks/realtime/RealtimeContext';
import { useWebSocket } from '~/hooks/websocket/useWebSocket';
import { env } from '~/lib/env';
import { notificationsKey } from '~/queries/notifications';
import type { LessonRef } from '~/services/QuestionService';
import { RealtimeService } from '~/services/RealtimeService';

const keyOf = (lesson: LessonRef | undefined) =>
  lesson ? `${lesson.courseId}/${lesson.lessonId}` : null;

// One connection per tab: the account's notices everywhere, plus one lesson's changes while a
// lesson page watches it.
export function RealtimeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const watcher = useRef<LessonWatcher | null>(null);
  // The lesson the connection's ticket was asked for.
  const ticketFor = useRef<string | null>(null);
  const opened = useRef(false);
  const [watched, setWatched] = useState<string | null>(null);

  const reloadInbox = () =>
    queryClient.invalidateQueries({ queryKey: notificationsKey });

  const { reconnect } = useWebSocket({
    url: enabled ? env.VITE_WS_URL : null,
    getTicket: () => {
      const lesson = watcher.current?.lesson;
      ticketFor.current = keyOf(lesson);

      return RealtimeService.ticket(lesson);
    },
    schema: realtimeChangeSchema,
    onMessage: (change) => {
      if (change.type === 'notifications') {
        void reloadInbox();

        return;
      }

      if (change.lessonId === watcher.current?.lesson.lessonId) {
        watcher.current.onChange(change);
      }
    },
    onOpen: () => {
      // What arrived while the socket was down only exists on the server.
      if (opened.current) {
        void reloadInbox();
      }

      opened.current = true;
      watcher.current?.onOpen();
    },
  });

  // The ticket fixes the lesson a connection hears: watching another one needs a new connection.
  // `watched` only wakes this effect; the ref holds the watcher even before the state catches up.
  useEffect(() => {
    if (!enabled) {
      opened.current = false;

      return;
    }

    if (keyOf(watcher.current?.lesson) !== ticketFor.current) {
      opened.current = false;
      reconnect();
    }
  }, [enabled, watched, reconnect]);

  const realtime = useMemo<Realtime>(
    () => ({
      watchLesson: (next) => {
        watcher.current = next;
        setWatched(keyOf(next.lesson));

        return () => {
          if (watcher.current === next) {
            watcher.current = null;
            setWatched(null);
          }
        };
      },
    }),
    [],
  );

  return <RealtimeContext value={realtime}>{children}</RealtimeContext>;
}

export function AccountRealtime({ children }: { children: React.ReactNode }) {
  const { signedIn } = useAuth();

  return <RealtimeProvider enabled={signedIn}>{children}</RealtimeProvider>;
}
