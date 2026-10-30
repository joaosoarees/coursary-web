import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '~/lib/utils';
import type { Theme } from '~/theme/themeScript';
import { useTheme } from '~/theme/useTheme';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

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
          className="inline-grid size-10 place-items-center rounded-md text-shell-muted transition-colors hover:text-shell-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow aria-pressed:bg-shell-foreground/10 aria-pressed:text-chalk-yellow"
        >
          <Icon aria-hidden="true" className="size-[1.125rem]" />
        </button>
      ))}
    </div>
  );
}
