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

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarHeader className="px-4 pt-6 pb-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-3">
        <div className="flex min-h-10 items-center px-2 group-data-[collapsible=icon]:px-0">
          <Wordmark />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-1">
        <SidebarGroup>
          <nav aria-label="Principal">
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {NAV.map(({ to, label, Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                      className="group/nav h-auto items-start gap-3 py-2 text-shell-foreground/85 group-data-[collapsible=icon]:items-center aria-[current=page]:font-bold aria-[current=page]:text-shell-foreground group-data-[collapsible=icon]:aria-[current=page]:bg-sidebar-accent"
                    >
                      <Icon
                        aria-hidden="true"
                        className="mt-0.5 text-shell-muted group-aria-[current=page]/nav:text-chalk-yellow group-data-[collapsible=icon]:mt-0"
                      />
                      <span className="flex flex-col gap-0.5">
                        {label}
                        <ChalkStroke className="hidden w-16 text-chalk-yellow group-aria-[current=page]/nav:block" />
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mx-4 mb-4 gap-2.5 border-t border-sidebar-border px-0 pt-3.5 group-data-[collapsible=icon]:mx-3 group-data-[collapsible=icon]:items-center">
        {collapsed ? <ThemeCycleButton /> : <ThemeSwitcher />}
        <AccountMenu side={collapsed ? 'right' : 'top'} />
      </SidebarFooter>
    </Sidebar>
  );
}
