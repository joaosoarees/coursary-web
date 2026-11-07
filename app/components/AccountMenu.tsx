import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { initialsOf } from '~/account/initialsOf';
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
      <div className="flex items-center gap-3 p-0.5" aria-hidden="true">
        <Skeleton className="size-9 shrink-0 rounded-full bg-shell-hover after:via-chalk/10" />
        {!compact && (
          <Skeleton className="h-4 w-28 bg-shell-hover transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 after:via-chalk/10" />
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
            'flex items-center gap-3 overflow-hidden p-0.5 text-left transition-[background-color,border-radius] duration-200 hover:bg-shell-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow',
            compact
              ? 'rounded-full hover:bg-transparent hover:outline-2 hover:outline-shell-foreground/35'
              : 'w-full rounded-md group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:outline-2 group-data-[collapsible=icon]:hover:outline-shell-foreground/35',
          )}
        >
          <Avatar className="size-9 shrink-0">
            {me.data?.avatarUrl?.['64'] && (
              <AvatarImage src={me.data.avatarUrl['64']} alt="" />
            )}
            <AvatarFallback className="bg-chalk-yellow font-bold text-chalk-yellow-foreground">
              {me.data ? initialsOf(me.data.name) : '?'}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <>
              <span className="min-w-0 flex-1 truncate font-bold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                {name}
              </span>
              <ChevronsUpDown
                aria-hidden="true"
                className="mr-1.5 size-4 shrink-0 text-shell-muted transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0"
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
        <DropdownMenuItem asChild>
          <Link to="/perfil">
            <UserRound aria-hidden="true" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
