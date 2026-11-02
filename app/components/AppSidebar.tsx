import { House } from 'lucide-react';
import { NavLink } from 'react-router';

import { AccountMenu } from '~/components/AccountMenu';
import { ChalkStroke } from '~/components/ChalkStroke';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { Wordmark } from '~/components/Wordmark';
import { ThemeCycleButton, ThemeSwitcher } from '~/theme/ThemeSwitcher';

const NAV = [{ to: '/', label: 'Início', Icon: House }];

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
  const collapsed = state === 'collapsed' && !isMobile;

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarHeader className="overflow-hidden px-3 pt-6 pb-2">
        <div className="flex min-h-10 items-center px-1.5">
          <Wordmark />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup className="p-0">
          <nav aria-label="Principal">
            <SidebarMenu>
              {NAV.map(({ to, label, Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                      className="group/nav h-11 gap-3 px-[11px] text-shell-foreground/85 transition-[background-color] duration-200 aria-[current=page]:font-bold aria-[current=page]:text-shell-foreground group-data-[collapsible=icon]:aria-[current=page]:bg-sidebar-accent"
                    >
                      <Icon
                        aria-hidden="true"
                        className="text-shell-muted group-aria-[current=page]/nav:text-chalk-yellow"
                      />
                      <span className={`relative ${FADES}`}>
                        {label}
                        <ChalkStroke className="absolute top-full left-0 hidden w-16 text-chalk-yellow group-aria-[current=page]/nav:block" />
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
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
        <AccountMenu side={collapsed ? 'right' : 'top'} />
      </SidebarFooter>
    </Sidebar>
  );
}
