import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  GraduationCap,
  Library,
  type LucideIcon,
  Presentation,
} from 'lucide-react';
import { useState } from 'react';
import { fn } from 'storybook/test';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar';

const items: { label: string; Icon: LucideIcon; badge?: string }[] = [
  { label: 'Catálogo', Icon: Library },
  { label: 'Minhas matrículas', Icon: GraduationCap, badge: '3' },
  { label: 'Meus cursos', Icon: Presentation },
];

type SidebarStoryArgs = React.ComponentProps<typeof SidebarProvider> & {
  collapsible: 'offcanvas' | 'icon' | 'none';
  variant: 'sidebar' | 'floating' | 'inset';
  side: 'left' | 'right';
};

const meta = {
  title: 'UI/Sidebar',
  component: SidebarProvider,
  args: {
    defaultOpen: true,
    onOpenChange: fn(),
    collapsible: 'icon',
    variant: 'sidebar',
    side: 'left',
  },
  argTypes: {
    defaultOpen: { control: false },
    open: { control: false },
    collapsible: {
      control: 'inline-radio',
      options: ['offcanvas', 'icon', 'none'],
    },
    variant: {
      control: 'inline-radio',
      options: ['sidebar', 'floating', 'inset'],
    },
    side: { control: 'inline-radio', options: ['left', 'right'] },
  },
  // Held in the story, not in the provider: the provider would read and write the app's stored choice.
  render: function Render({
    collapsible,
    variant,
    side,
    defaultOpen = true,
    onOpenChange,
    ...args
  }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <SidebarProvider
        {...args}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <Sidebar collapsible={collapsible} variant={variant} side={side}>
          <SidebarHeader>
            <p className="px-2 font-display text-lg font-bold group-data-[collapsible=icon]:sr-only">
              Coursary
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Estudar</SidebarGroupLabel>
              <SidebarMenu>
                {items.map(({ label, Icon, badge }, index) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      asChild
                      isActive={index === 0}
                      tooltip={label}
                    >
                      <a href={`#${label}`}>
                        <Icon aria-hidden="true" />
                        <span className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                          {label}
                        </span>
                      </a>
                    </SidebarMenuButton>
                    {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <p className="px-2 text-sm group-data-[collapsible=icon]:sr-only">
              Ana Lima
            </p>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center gap-2 border-b p-3">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">
              Ctrl+B também abre e fecha
            </span>
          </header>
          <div className="p-6">
            <h1 className="font-display text-2xl font-bold">Catálogo</h1>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'A navegação lateral do app. `SidebarProvider` guarda se está aberta e dá o atalho Ctrl+B; `SidebarTrigger` abre e fecha. Com `collapsible="icon"`, fechada vira uma faixa só de ícones: quem monta o menu esconde os rótulos com `group-data-[collapsible=icon]`, e o `tooltip` de cada `SidebarMenuButton` dá o nome. Abaixo de 768 px vira um Sheet. O item da página atual leva `isActive`. Fora do Storybook, o provider lembra a escolha no `localStorage`.',
      },
    },
  },
} satisfies Meta<SidebarStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { defaultOpen: false } };

export const Offcanvas: Story = {
  args: { defaultOpen: false, collapsible: 'offcanvas' },
};

export const Floating: Story = { args: { variant: 'floating' } };

export const Inset: Story = { args: { variant: 'inset' } };
