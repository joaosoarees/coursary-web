import { ShowcaseSection } from '~/design/ShowcaseSection';
import { cn } from '~/lib/utils';

const SURFACES = [
  {
    name: 'background · foreground',
    className: 'bg-background text-foreground',
  },
  { name: 'card', className: 'bg-card text-card-foreground' },
  { name: 'popover', className: 'bg-popover text-popover-foreground' },
  { name: 'primary', className: 'bg-primary text-primary-foreground' },
  {
    name: 'primary-hover',
    className: 'bg-primary-hover text-primary-foreground',
  },
  { name: 'secondary', className: 'bg-secondary text-secondary-foreground' },
  { name: 'muted', className: 'bg-muted text-muted-foreground' },
  { name: 'accent', className: 'bg-accent text-accent-foreground' },
  {
    name: 'destructive',
    className: 'bg-destructive text-destructive-foreground',
  },
  {
    name: 'destructive-hover',
    className: 'bg-destructive-hover text-destructive-foreground',
  },
  { name: 'success-soft · success', className: 'bg-success-soft text-success' },
  {
    name: 'highlight',
    className: 'border-highlight-border bg-highlight text-highlight-foreground',
  },
  { name: 'shell', className: 'bg-shell text-shell-foreground' },
  { name: 'shell-hover', className: 'bg-shell-hover text-shell-foreground' },
  { name: 'board · chalk', className: 'bg-board text-chalk' },
];

const LINES = [
  { name: 'border', className: 'border-border' },
  { name: 'input', className: 'border-input' },
  { name: 'ring', className: 'border-ring' },
];

const CHALKS = [
  { name: 'chalk-yellow', className: 'text-chalk-yellow' },
  { name: 'chalk-blue', className: 'text-chalk-blue' },
  { name: 'chalk-pink', className: 'text-chalk-pink' },
  { name: 'shell-muted', className: 'text-shell-muted' },
];

function Palette({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      className={cn(
        theme,
        'flex flex-col gap-5 rounded-lg border bg-background p-5 text-foreground',
      )}
    >
      <h3 className="font-display text-xl font-bold">
        {theme === 'light' ? 'Claro' : 'Escuro'}
      </h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SURFACES.map(({ name, className }) => (
          <li
            key={name}
            className={cn(
              'flex min-h-24 flex-col justify-between gap-2 rounded-lg border p-3',
              className,
            )}
          >
            <span className="font-display text-2xl font-bold">Aa</span>
            <code className="text-sm">{name}</code>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-3">
        {LINES.map(({ name, className }) => (
          <li
            key={name}
            className={cn('rounded-md border-2 bg-card px-3 py-2', className)}
          >
            <code className="text-sm">{name}</code>
          </li>
        ))}
        <li className="px-3 py-2">
          <code className="text-sm text-link underline underline-offset-4">
            link
          </code>
        </li>
      </ul>
      <ul className="flex flex-wrap gap-4 rounded-lg bg-board px-4 py-3">
        {CHALKS.map(({ name, className }) => (
          <li key={name}>
            <code className={cn('text-sm font-bold', className)}>{name}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ColorSection() {
  return (
    <ShowcaseSection
      id="cores"
      title="Cores"
      description="Cada superfície com o texto que vai sobre ela, nos dois temas. Os pares têm o contraste medido em app/theme.spec.ts."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <Palette theme="light" />
        <Palette theme="dark" />
      </div>
    </ShowcaseSection>
  );
}
