import { ChalkStroke } from '~/components/ChalkStroke';
import { Wordmark } from '~/components/Wordmark';
import { ThemeSwitcher } from '~/theme/ThemeSwitcher';

export function VisitorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-chalk-yellow focus:px-4 focus:py-2 focus:font-bold focus:text-black"
      >
        Pular para o conteúdo
      </a>
      <header className="flex items-center justify-between gap-4 bg-shell px-5 py-4 text-shell-foreground md:sticky md:top-0 md:h-screen md:w-[min(44%,38rem)] md:shrink-0 md:flex-col md:items-stretch md:gap-10 md:px-14 md:py-12">
        <Wordmark />
        <div className="hidden max-w-md flex-col gap-4 md:flex">
          <p className="font-display text-5xl leading-[1.08] font-bold tracking-tight text-balance">
            Aprenda no seu ritmo. Ensine o que você sabe.
          </p>
          <ChalkStroke className="w-60 text-chalk-yellow" />
          <p className="max-w-[42ch] text-lg text-shell-muted">
            Cursos em vídeo com material de apoio, progresso salvo aula a aula e
            um editor para quem quer publicar o próprio curso.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 md:border-t md:border-shell-foreground/10 md:pt-4">
          <p className="hidden max-w-[32ch] text-sm text-shell-muted md:block">
            Projeto de portfólio. Cursos, nomes e números são exemplos.
          </p>
          <ThemeSwitcher />
        </div>
      </header>
      <main
        id="conteudo"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-5 py-8 outline-none md:px-10 md:py-12"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
