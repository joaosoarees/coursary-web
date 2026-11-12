import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { NotificationBell } from '~/components/notifications/NotificationBell';
import { SkipLink } from '~/components/SkipLink';
import { BoardMark } from '~/components/Wordmark';
import { useFocusOnNavigation } from '~/hooks/useFocusOnNavigation';

export function ClassroomShell({
  back,
  backLabel = 'Sair da aula',
  courseTitle,
  children,
}: {
  back: string;
  backLabel?: string;
  courseTitle: string | undefined;
  children: React.ReactNode;
}) {
  const main = useFocusOnNavigation<HTMLElement>();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SkipLink />
      <header className="flex min-h-14 items-center gap-2.5 bg-shell px-3 py-2 text-shell-foreground md:min-h-15 md:gap-4 md:px-6">
        <Link
          to={back}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md pr-3 pl-2 font-bold hover:bg-shell-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow"
        >
          <ChevronLeft aria-hidden="true" className="size-4.5" />
          {backLabel}
        </Link>
        <span
          aria-hidden="true"
          className="h-6 w-px shrink-0 bg-shell-foreground/20"
        />
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="hidden md:block">
            <BoardMark size={26} />
          </span>
          <span className="truncate font-display text-base font-bold md:text-xl">
            {courseTitle}
          </span>
        </span>
        <span className="ml-auto shrink-0">
          <NotificationBell tone="shell" />
        </span>
      </header>
      <main
        ref={main}
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-[92rem] flex-1 px-5 py-6 outline-none md:px-14 md:py-8"
      >
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[92rem] px-5 py-6 text-sm text-muted-foreground md:px-14">
        Projeto de portfólio. Cursos, nomes e números são exemplos.
      </footer>
    </div>
  );
}
