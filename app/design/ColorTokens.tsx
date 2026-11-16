import { CssValue, cssVariable } from '~/design/CssValue';
import { cn } from '~/lib/utils';

const SURFACES = [
  {
    tokens: ['background', 'foreground'],
    className: 'bg-background text-foreground',
  },
  {
    tokens: ['card', 'card-foreground'],
    className: 'bg-card text-card-foreground',
  },
  {
    tokens: ['popover', 'popover-foreground'],
    className: 'bg-popover text-popover-foreground',
  },
  {
    tokens: ['primary', 'primary-foreground'],
    className: 'bg-primary text-primary-foreground',
  },
  {
    tokens: ['primary-hover'],
    className: 'bg-primary-hover text-primary-foreground',
  },
  {
    tokens: ['secondary', 'secondary-foreground'],
    className: 'bg-secondary text-secondary-foreground',
  },
  {
    tokens: ['muted', 'muted-foreground'],
    className: 'bg-muted text-muted-foreground',
  },
  {
    tokens: ['accent', 'accent-foreground'],
    className: 'bg-accent text-accent-foreground',
  },
  {
    tokens: ['destructive', 'destructive-foreground'],
    className: 'bg-destructive text-destructive-foreground',
  },
  {
    tokens: ['destructive-hover'],
    className: 'bg-destructive-hover text-destructive-foreground',
  },
  {
    tokens: ['success-soft', 'success'],
    className: 'bg-success-soft text-success',
  },
  {
    tokens: ['highlight', 'highlight-foreground', 'highlight-border'],
    className: 'border-highlight-border bg-highlight text-highlight-foreground',
  },
  {
    tokens: ['highlight-hover'],
    className:
      'border-highlight-border bg-highlight-hover text-highlight-foreground',
  },
  {
    tokens: ['shell', 'shell-foreground'],
    className: 'bg-shell text-shell-foreground',
  },
  {
    tokens: ['shell-hover'],
    className: 'bg-shell-hover text-shell-foreground',
  },
  { tokens: ['board', 'chalk'], className: 'bg-board text-chalk' },
  {
    tokens: ['chalk-yellow', 'chalk-yellow-foreground'],
    className: 'bg-chalk-yellow text-chalk-yellow-foreground',
  },
  {
    tokens: ['screen', 'screen-muted'],
    className: 'bg-screen text-screen-muted',
  },
];

const LINES = [
  { token: 'border', className: 'border-border' },
  { token: 'input', className: 'border-input' },
  { token: 'ring', className: 'border-ring' },
];

// Star and progress fill icons and bars, not text: their names would fail as text in them.
const MARKS = [
  { token: 'star', className: 'bg-star' },
  { token: 'progress', className: 'bg-progress' },
];

const CHALKS = [
  { token: 'chalk-yellow', className: 'text-chalk-yellow' },
  { token: 'chalk-blue', className: 'text-chalk-blue' },
  { token: 'chalk-pink', className: 'text-chalk-pink' },
  { token: 'shell-muted', className: 'text-shell-muted' },
];

function Token({ name }: { name: string }) {
  return (
    <span className="flex flex-wrap items-baseline justify-between gap-x-2">
      <code className="text-sm font-bold">{name}</code>
      <CssValue read={cssVariable(`--${name}`)} />
    </span>
  );
}

// Both themes side by side, whatever the toolbar says: `.light` and `.dark` each set their tokens.
export function ColorTokens({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      className={cn(
        theme,
        'flex flex-col gap-5 rounded-lg border bg-background p-5 text-foreground',
      )}
    >
      <p className="font-display text-xl font-bold">
        {theme === 'light' ? 'Claro' : 'Escuro'}
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
        {SURFACES.map(({ tokens, className }) => (
          <li
            key={tokens.join()}
            className={cn(
              'flex min-h-28 flex-col justify-between gap-2 rounded-lg border p-3',
              className,
            )}
          >
            <span className="font-display text-2xl font-bold">Aa</span>
            <span className="flex flex-col gap-0.5">
              {tokens.map((token) => (
                <Token key={token} name={token} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
        {LINES.map(({ token, className }) => (
          <li
            key={token}
            className={cn('rounded-md border-2 bg-card px-3 py-2', className)}
          >
            <Token name={token} />
          </li>
        ))}
        <li className="px-3 py-2 text-link">
          <Token name="link" />
        </li>
        {MARKS.map(({ token, className }) => (
          <li key={token} className="flex items-center gap-2 px-3 py-2">
            <span
              aria-hidden="true"
              className={cn('size-3.5 shrink-0 rounded-full', className)}
            />
            <span className="flex-1">
              <Token name={token} />
            </span>
          </li>
        ))}
      </ul>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3 rounded-lg bg-board p-3">
        {CHALKS.map(({ token, className }) => (
          <li key={token} className={className}>
            <Token name={token} />
          </li>
        ))}
      </ul>
    </div>
  );
}
