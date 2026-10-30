import { NavLink } from 'react-router';

import { ChalkStroke } from '~/components/ChalkStroke';
import { ThemeSwitcher } from '~/theme/ThemeSwitcher';

const NAV = [{ to: '/', label: 'Início' }];

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 34 34" aria-hidden="true">
        <rect
          x="1.5"
          y="5.5"
          width="31"
          height="21"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M7 20 C 11 16, 14 18, 18 14"
          fill="none"
          className="stroke-chalk-yellow"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M10 30.5 h14"
          className="stroke-shell-muted"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-[1.375rem] font-extrabold tracking-tight">
        Coursary
      </span>
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-chalk-yellow focus:px-4 focus:py-2 focus:font-bold focus:text-black"
      >
        Pular para o conteúdo
      </a>
      <div className="flex w-full flex-col gap-6 bg-shell px-5 py-5 text-shell-foreground md:sticky md:top-0 md:h-screen md:w-64 md:gap-8 md:py-7">
        <div className="flex items-center justify-between gap-4 px-2">
          <Wordmark />
          <ThemeSwitcher className="md:hidden" />
        </div>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap gap-1 md:flex-col">
            {NAV.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className="group flex min-h-10 flex-col justify-center rounded-md px-3 py-2 text-shell-foreground/85 transition-colors hover:bg-shell-hover hover:text-shell-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow aria-[current=page]:bg-shell-hover aria-[current=page]:font-bold aria-[current=page]:text-shell-foreground"
                >
                  <span>{label}</span>
                  <ChalkStroke className="hidden w-16 text-chalk-yellow group-aria-[current=page]:block" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto hidden border-t border-shell-foreground/10 pt-4 md:block">
          <ThemeSwitcher />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 basis-[36rem] flex-col">
        <main
          id="conteudo"
          tabIndex={-1}
          className="w-full max-w-6xl flex-1 px-5 py-8 outline-none md:px-14 md:py-10"
        >
          {children}
        </main>
        <footer className="px-5 py-6 text-sm text-muted-foreground md:px-14">
          Projeto de portfólio. Cursos, nomes e números são exemplos.
        </footer>
      </div>
    </div>
  );
}
