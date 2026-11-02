import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '~/lib/utils';
import type { Theme } from '~/theme/themeScript';
import { useTheme } from '~/theme/useTheme';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

const THEMES = Object.fromEntries(
  OPTIONS.map((option) => [option.value, option]),
) as Record<Theme, (typeof OPTIONS)[number]>;

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div role="group" aria-label="Tema" className={cn('flex gap-1', className)}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          aria-label={label}
          title={label}
          onClick={() => {
            setTheme(value);
          }}
          className="inline-grid size-10 place-items-center rounded-md text-shell-muted transition-colors hover:bg-shell-hover hover:text-shell-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow aria-pressed:bg-shell-hover aria-pressed:text-chalk-yellow"
        >
          <Icon aria-hidden="true" className="size-4.5" />
        </button>
      ))}
    </div>
  );
}

export function ThemeCycleButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const current = THEMES[theme];
  const next = THEMES[NEXT_THEME[theme]];
  const { Icon } = current;

  return (
    <button
      type="button"
      aria-label={`Tema: ${current.label}. Trocar para ${next.label.toLowerCase()}`}
      title={`Tema: ${current.label}`}
      onClick={() => {
        setTheme(NEXT_THEME[theme]);
      }}
      className={cn(
        'inline-grid size-10 place-items-center rounded-md text-chalk-yellow transition-colors hover:bg-shell-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4.5" />
    </button>
  );
}
