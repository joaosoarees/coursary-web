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
import { useMe } from '~/queries/me';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

export function AccountMenu() {
  const { signOut } = useAuth();
  const me = useMe();

  const handleSignOut = async () => {
    await signOut();
    toast('Você saiu.');
  };

  if (me.isPending) {
    return (
      <div className="flex items-center gap-3 px-2 py-1.5" aria-hidden="true">
        <Skeleton className="size-9 rounded-full bg-shell-hover" />
        <Skeleton className="h-4 w-28 bg-shell-hover max-md:hidden" />
      </div>
    );
  }

  const name = me.data?.name ?? 'Sua conta';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex min-h-12 items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-shell-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow md:w-full"
        >
          <Avatar className="size-9">
            {me.data?.avatarUrl?.['64'] && (
              <AvatarImage src={me.data.avatarUrl['64']} alt="" />
            )}
            <AvatarFallback className="bg-chalk-yellow font-bold text-black">
              {me.data ? initialsOf(me.data.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate font-bold max-md:sr-only">
            {name}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-shell-muted max-md:hidden"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
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
