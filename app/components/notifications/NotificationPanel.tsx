import { BellOff, CheckCheck } from 'lucide-react';
import { useState } from 'react';

import { ErrorState } from '~/components/ErrorState';
import { LoadMore } from '~/components/LoadMore';
import { NotificationItem } from '~/components/notifications/NotificationItem';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '~/mutations/notifications';
import type { useNotifications } from '~/queries/notifications';
import type { Notification } from '~/services/NotificationService';

const SKELETON_WIDTHS = ['w-11/12', 'w-4/5', 'w-5/6'];

export function NotificationPanel({
  inbox,
  unreadCount,
  onNavigate,
}: {
  inbox: ReturnType<typeof useNotifications>;
  unreadCount: number;
  onNavigate: () => void;
}) {
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [announcement, setAnnouncement] = useState('');
  // One clock per opening: the times on the list do not tick while it is open.
  const [now] = useState(() => new Date());
  const items = inbox.data?.pages.flatMap((page) => page.items) ?? [];

  const open = (notification: Notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }

    onNavigate();
  };

  const markAllRead = () => {
    markAll.mutate(undefined, {
      onSuccess: () => {
        setAnnouncement('Todas as notificações foram marcadas como lidas.');
      },
      onError: () => {
        setAnnouncement(
          'Não foi possível marcar as notificações. Tente de novo.',
        );
      },
    });
  };

  return (
    <section
      aria-labelledby="notificacoes-titulo"
      className="flex max-h-[min(560px,calc(100dvh-5rem))] flex-col"
    >
      <div className="flex items-center gap-2 border-b py-3 pr-2 pl-4">
        <h2
          id="notificacoes-titulo"
          tabIndex={-1}
          className="flex-1 font-display text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Notificações
        </h2>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            disabled={markAll.isPending}
            onClick={markAllRead}
          >
            <CheckCheck aria-hidden="true" />
            Marcar todas como lidas
          </Button>
        )}
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {inbox.isPending && (
        <div
          role="status"
          aria-label="Carregando as notificações"
          className="flex flex-col gap-4 px-4 pt-2 pb-4"
        >
          {SKELETON_WIDTHS.map((width) => (
            <div key={width} className="flex gap-3">
              <Skeleton className="size-8 flex-none rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className={`h-3.5 ${width}`} />
                <Skeleton className="h-3.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {inbox.isLoadingError && (
        <div className="p-4">
          <ErrorState
            variant="block"
            title="As notificações não carregaram."
            message="Confira a conexão e tente de novo."
            onRetry={() => {
              void inbox.refetch();
            }}
          />
        </div>
      )}

      {inbox.isSuccess && items.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <BellOff
            aria-hidden="true"
            className="size-8 text-muted-foreground"
          />
          <p className="font-bold">Nenhuma notificação</p>
          <p className="max-w-72 text-sm text-muted-foreground">
            Respostas às suas perguntas, aulas novas, cursos arquivados e
            perguntas nos seus cursos aparecem aqui.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <ul className="flex flex-col gap-0.5 overflow-y-auto p-1">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                now={now}
                onOpen={open}
              />
            ))}
          </ul>
          {(inbox.hasNextPage || inbox.isFetchNextPageError) && (
            <div className="flex justify-center border-t px-3 pt-2 pb-3">
              <LoadMore
                list={inbox}
                auto={false}
                size="sm"
                labels={{
                  more: 'Carregar mais',
                  loading: 'Carregando…',
                  failed: 'As notificações seguintes não carregaram.',
                }}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
