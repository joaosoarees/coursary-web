import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { BoardMark } from '~/components/Wordmark';
import { useFocusOnNavigation } from '~/hooks/useFocusOnNavigation';

// The lesson is a classroom: no app rail, only the way out and the course on the board.
export function ClassroomShell({
  back,
  courseTitle,
  children,
}: {
  back: string;
  courseTitle: string | undefined;
  children: React.ReactNode;
}) {
  const main = useFocusOnNavigation<HTMLElement>();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-chalk-yellow focus:px-4 focus:py-2 focus:font-bold focus:text-chalk-yellow-foreground"
      >
        Pular para o conteúdo
      </a>
      <header className="flex min-h-14 items-center gap-2.5 bg-shell px-3 py-2 text-shell-foreground md:min-h-15 md:gap-4 md:px-6">
        <Link
          to={back}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md pr-3 pl-2 font-bold hover:bg-shell-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow"
        >
          <ChevronLeft aria-hidden="true" className="size-4.5" />
          Sair da aula
        </Link>
        <span
          aria-hidden="true"
          className="h-6 w-px shrink-0 bg-shell-foreground/20"
        />
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="hidden md:block">
            <BoardMark size={26} />
          </span>
          <span className="truncate font-display text-base font-bold md:text-lg">
            {courseTitle}
          </span>
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
