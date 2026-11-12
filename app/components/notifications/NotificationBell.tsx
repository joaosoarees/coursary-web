import { Bell } from 'lucide-react';
import { useState } from 'react';

import { NotificationCopy } from '~/components/notifications/NotificationCopy';
import { NotificationPanel } from '~/components/notifications/NotificationPanel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { cn } from '~/lib/utils';
import { useNotifications } from '~/queries/notifications';

// `header` sits on the shell on a phone and on the page from md up; `shell` is always on the shell.
const triggerTones = {
  header:
    'text-shell-foreground hover:bg-shell-hover focus-visible:outline-chalk-yellow data-[state=open]:bg-shell-hover md:text-muted-foreground md:hover:bg-accent md:hover:text-accent-foreground md:focus-visible:outline-ring md:data-[state=open]:bg-accent md:data-[state=open]:text-accent-foreground',
  shell:
    'text-shell-foreground hover:bg-shell-hover focus-visible:outline-chalk-yellow data-[state=open]:bg-shell-hover',
};

// On the shell the badge is chalk; on the light page a yellow pill would vanish, so it turns
// into a piece of the shell with chalk on it.
const badgeTones = {
  header:
    'border-shell bg-chalk-yellow text-chalk-yellow-foreground md:dark:border-background md:dark:bg-chalk-yellow md:dark:text-chalk-yellow-foreground md:bg-shell md:text-chalk-yellow',
  shell: 'border-shell bg-chalk-yellow text-chalk-yellow-foreground',
};

export function NotificationBell({
  tone = 'header',
}: {
  tone?: keyof typeof triggerTones;
}) {
  const [open, setOpen] = useState(false);
  const inbox = useNotifications();
  // The last count known stays while the list reloads or fails to.
  const unreadCount = inbox.data?.pages[0]?.unreadCount ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={NotificationCopy.unreadLabel(unreadCount)}
        className={cn(
          'relative grid size-10 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
          triggerTones[tone],
        )}
      >
        <Bell aria-hidden="true" className="size-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-0.5 -right-1.5 h-5 min-w-5 rounded-full border px-1.5 text-center text-xs leading-[18px] font-bold whitespace-nowrap',
              badgeTones[tone],
            )}
          >
            {NotificationCopy.badge(unreadCount)}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={14}
        collisionPadding={8}
        aria-labelledby="notificacoes-titulo"
        className="w-[400px] max-w-[calc(100vw-16px)] overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById('notificacoes-titulo')?.focus();
        }}
      >
        <NotificationPanel
          inbox={inbox}
          unreadCount={unreadCount}
          onNavigate={() => {
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
