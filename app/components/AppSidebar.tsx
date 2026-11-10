import {
  GraduationCap,
  Library,
  type LucideIcon,
  Presentation,
  Users,
} from 'lucide-react';
import { useId } from 'react';
import { Link, useLocation } from 'react-router';

import { canAdminister } from '~/auth/AdminGuard';
import { canTeach } from '~/auth/TeachingGuard';
import { AccountFallback, AccountMenu } from '~/components/AccountMenu';
import { BlockBoundary } from '~/components/BlockBoundary';
import { ChalkStroke } from '~/components/ChalkStroke';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { Wordmark } from '~/components/Wordmark';
import { useMe } from '~/queries/me';
import type { Profile } from '~/services/AccountService';
import { ThemeCycleButton, ThemeSwitcher } from '~/theme/ThemeSwitcher';

const within = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

const SECTIONS: {
  label: string;
  shows: (role: Profile['role'] | undefined) => boolean;
  items: NavItem[];
}[] = [
  {
    label: 'Estudar',
    shows: () => true,
    items: [
      { to: '/cursos', label: 'Catálogo', Icon: Library },
      {
        to: '/minhas-matriculas',
        label: 'Minhas matrículas',
        Icon: GraduationCap,
      },
    ],
  },
  {
    label: 'Ensinar',
    shows: (role) => role !== undefined && canTeach(role),
    items: [
      { to: '/instrutor/cursos', label: 'Meus cursos', Icon: Presentation },
    ],
  },
  {
    label: 'Administrar',
    shows: (role) => role !== undefined && canAdminister(role),
    items: [{ to: '/admin/usuarios', label: 'Usuários', Icon: Users }],
  },
];

// Every icon keeps its place in both widths, so collapsing only animates the width and fades the
// labels: nothing changes size or padding mid-transition.
const FADES =
  'transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0';
const HIDES_WHEN_COLLAPSED =
  'transition-[opacity,visibility] duration-200 group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0';
const SHOWS_WHEN_COLLAPSED =
  'invisible opacity-0 transition-[opacity,visibility] duration-200 group-data-[collapsible=icon]:visible group-data-[collapsible=icon]:opacity-100';

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const collapsed = state === 'collapsed' && !isMobile;
  const me = useMe();
  const sections = SECTIONS.filter((section) => section.shows(me.data?.role));

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarHeader className="overflow-hidden px-3 pt-6 pb-2">
        <div className="flex min-h-10 items-center px-1.5">
          <Wordmark />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2.5 py-4">
        <nav aria-label="Principal" className="flex flex-col gap-5">
          {sections.map((section, index) => (
            <NavSection
              key={section.label}
              divided={index > 0}
              label={section.label}
              items={section.items}
              pathname={pathname}
              onNavigate={() => {
                setOpenMobile(false);
              }}
            />
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="mx-3 mb-4 gap-2.5 border-t border-sidebar-border px-0 pt-3.5">
        <div className="grid">
          <ThemeSwitcher
            className={`[grid-area:1/1] ${HIDES_WHEN_COLLAPSED}`}
          />
          <ThemeCycleButton
            className={`[grid-area:1/1] ${SHOWS_WHEN_COLLAPSED}`}
          />
        </div>
        <BlockBoundary fallback={<AccountFallback />}>
          <AccountMenu side={collapsed ? 'right' : 'top'} />
        </BlockBoundary>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavSection({
  divided,
  label,
  items,
  pathname,
  onNavigate,
}: {
  divided: boolean;
  label: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  const labelId = useId();

  return (
    <SidebarGroup role="group" aria-labelledby={labelId} className="p-0">
      {/* Faded but kept in place when collapsed, so the icons below it do not move. */}
      <SidebarGroupLabel
        id={labelId}
        className={`h-7 items-start px-[13px] text-sm font-bold tracking-[0.06em] whitespace-nowrap text-shell-muted uppercase group-data-[collapsible=icon]:mt-0 ${FADES}`}
      >
        {label}
      </SidebarGroupLabel>
      {divided && (
        <span
          aria-hidden="true"
          className={`absolute top-3 left-1/2 h-px w-6 -translate-x-1/2 bg-shell-foreground/10 ${SHOWS_WHEN_COLLAPSED}`}
        />
      )}
      <SidebarMenu>
        {items.map(({ to, label: itemLabel, Icon }) => (
          <SidebarMenuItem key={to}>
            <SidebarMenuButton asChild tooltip={itemLabel}>
              <Link
                to={to}
                aria-current={within(pathname, to) ? 'page' : undefined}
                onClick={onNavigate}
                className="group/nav h-11 gap-3 px-[13px] text-shell-foreground/85 transition-[background-color] duration-200 aria-[current]:font-bold aria-[current]:text-shell-foreground group-data-[collapsible=icon]:aria-[current]:bg-sidebar-accent"
              >
                <Icon
                  aria-hidden="true"
                  className="text-shell-muted group-aria-[current]/nav:text-chalk-yellow"
                />
                <span className={`relative ${FADES}`}>
                  {itemLabel}
                  <ChalkStroke
                    draw
                    className="absolute top-full left-0 hidden w-16 text-chalk-yellow group-aria-[current]/nav:block"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
