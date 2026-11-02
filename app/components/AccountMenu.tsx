import { ChevronsUpDown, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '~/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import { useMe } from '~/queries/me';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

export function AccountMenu({
  compact = false,
  side = 'top',
}: {
  compact?: boolean;
  side?: 'top' | 'right' | 'bottom';
}) {
  const { signOut } = useAuth();
  const me = useMe();

  const handleSignOut = async () => {
    await signOut();
    toast('Você saiu.');
  };

  if (me.isPending) {
    return (
      <div className="flex items-center gap-3 px-1.5 py-1.5" aria-hidden="true">
        <Skeleton className="size-9 shrink-0 rounded-full bg-shell-hover" />
        {!compact && (
          <Skeleton className="h-4 w-28 bg-shell-hover group-data-[collapsible=icon]:hidden" />
        )}
      </div>
    );
  }

  const name = me.data?.name ?? 'Sua conta';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={compact ? name : undefined}
          className={cn(
            'flex min-h-12 items-center gap-3 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-shell-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow',
            compact ? 'rounded-full p-0.5' : 'w-full',
          )}
        >
          <Avatar className="size-9 shrink-0">
            {me.data?.avatarUrl?.['64'] && (
              <AvatarImage src={me.data.avatarUrl['64']} alt="" />
            )}
            <AvatarFallback className="bg-chalk-yellow font-bold text-black">
              {me.data ? initialsOf(me.data.name) : '?'}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <>
              <span className="min-w-0 flex-1 truncate font-bold group-data-[collapsible=icon]:sr-only">
                {name}
              </span>
              <ChevronsUpDown
                aria-hidden="true"
                className="size-4 shrink-0 text-shell-muted group-data-[collapsible=icon]:hidden"
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={side === 'bottom' ? 'end' : 'start'}
        className="w-60"
      >
        {me.data && (
          <>
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate font-bold">{me.data.name}</span>
              <span className="truncate font-normal text-muted-foreground">
                {me.data.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
