import {
  Archive,
  ArrowDownToLine,
  CirclePlay,
  MessageCircleQuestion,
  MessageCircleReply,
} from 'lucide-react';
import { Link } from 'react-router';

import { NotificationCopy } from '~/components/notifications/NotificationCopy';
import { RelativeTime } from '~/components/questions/RelativeTime';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { Notification } from '~/services/NotificationService';

const icons = {
  answer: MessageCircleReply,
  question: MessageCircleQuestion,
  lesson: CirclePlay,
  archived: Archive,
  'export-ready': ArrowDownToLine,
} as const;

export function NotificationItem({
  notification,
  now,
  onOpen,
}: {
  notification: Notification;
  now: Date;
  onOpen: (notification: Notification) => void;
}) {
  const Icon = icons[notification.kind];
  const unread = !notification.read;

  return (
    <li>
      <Link
        to={NotificationCopy.target(notification)}
        onClick={() => {
          onOpen(notification);
        }}
        className={cn(
          'flex gap-3 rounded-sm border p-[11px] text-sm leading-[1.45] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring max-md:text-base',
          unread
            ? 'border-highlight-border bg-highlight text-highlight-foreground hover:bg-highlight-hover'
            : 'border-transparent text-muted-foreground hover:bg-muted',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-8 flex-none place-items-center rounded-full',
            unread
              ? 'bg-shell text-chalk-yellow dark:bg-chalk-yellow dark:text-chalk-yellow-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span>
            {unread && <span className="sr-only">Não lida: </span>}
            {NotificationCopy.runs(notification).map((run, index) =>
              run.strong ? (
                <strong key={index}>{run.text}</strong>
              ) : (
                <span key={index}>{run.text}</span>
              ),
            )}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {notification.byInstructor && (
              <Badge variant="secondary">do instrutor</Badge>
            )}
            <time
              dateTime={notification.createdAt}
              title={RelativeTime.full(notification.createdAt)}
            >
              {RelativeTime.format(notification.createdAt, now)}
            </time>
          </span>
        </span>
        {unread && (
          <span
            aria-hidden="true"
            className="size-2.5 flex-none self-center rounded-full bg-star"
          />
        )}
      </Link>
    </li>
  );
}
