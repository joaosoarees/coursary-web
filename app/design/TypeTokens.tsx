import { CssValue } from '~/design/CssValue';

const SPECIMENS = [
  {
    label: 'font-display · text-4xl · título da página',
    className: 'font-display text-4xl leading-tight font-bold tracking-tight',
    text: 'TypeScript do zero',
  },
  {
    label: 'font-display · text-3xl · título de seção',
    className: 'font-display text-3xl font-bold tracking-tight',
    text: 'Módulo 1 · Primeiros passos',
  },
  {
    label: 'font-display · text-xl · título de bloco',
    className: 'font-display text-xl font-bold',
    text: 'Nenhum curso por aqui ainda',
  },
  {
    label: 'font-sans · text-base · texto',
    className: 'max-w-prose',
    text: 'Uma linha confortável fica entre 65 e 75 caracteres, e a Atkinson foi desenhada para distinguir letras parecidas como Il1 e O0.',
  },
  {
    label: 'font-sans · text-sm · muted-foreground · apoio',
    className: 'text-sm text-muted-foreground',
    text: '12 aulas · 3 h 40 min · atualizado em 30/10/2026',
  },
];

export function TypeTokens() {
  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-background p-5 text-foreground">
      {SPECIMENS.map(({ label, className, text }) => (
        <div key={label} data-specimen className="flex flex-col gap-1.5">
          <span className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-muted-foreground">
            <span className="font-bold">{label}</span>
            <CssValue
              read={(element) => {
                const sample = element
                  .closest('[data-specimen]')
                  ?.querySelector('[data-sample]');

                if (!sample) {
                  return '';
                }

                const style = getComputedStyle(sample);

                return `${style.fontSize} / ${style.lineHeight} · ${style.fontWeight}`;
              }}
            />
          </span>
          <p data-sample className={className}>
            {text}
          </p>
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-muted-foreground">
          tabular-nums · números alinhados, em toda a página
        </span>
        <p className="flex flex-col">
          <span>1.111 alunos</span>
          <span>9.808 alunos</span>
        </p>
      </div>
    </div>
  );
}
