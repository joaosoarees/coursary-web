import { AccountMenu } from '~/components/AccountMenu';
import { AppSidebar } from '~/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { Wordmark } from '~/components/Wordmark';
import { useFocusOnNavigation } from '~/hooks/useFocusOnNavigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const main = useFocusOnNavigation<HTMLElement>();

  return (
    <SidebarProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-chalk-yellow focus:px-4 focus:py-2 focus:font-bold focus:text-chalk-yellow-foreground"
      >
        Pular para o conteúdo
      </a>
      <AppSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex items-center gap-2 bg-shell px-3 py-2.5 text-shell-foreground md:border-b md:bg-transparent md:px-4 md:py-3 md:text-muted-foreground">
          <SidebarTrigger className="size-10 hover:bg-shell-hover hover:text-shell-foreground focus-visible:outline-chalk-yellow md:hover:bg-accent md:hover:text-accent-foreground md:focus-visible:outline-ring" />
          <div className="flex-1 md:hidden">
            <Wordmark />
          </div>
          <div className="md:hidden">
            <AccountMenu compact side="bottom" />
          </div>
        </header>
        <main
          ref={main}
          id="conteudo"
          tabIndex={-1}
          className="w-full flex-1 px-5 py-8 outline-none md:px-14 md:py-10"
        >
          {children}
        </main>
        <footer className="px-5 py-6 text-sm text-muted-foreground md:px-14">
          Projeto de portfólio. Cursos, nomes e números são exemplos.
        </footer>
      </div>
    </SidebarProvider>
  );
}
