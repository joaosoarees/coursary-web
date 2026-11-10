const RELATIVE = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

const SAME_YEAR = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
});

const OTHER_YEAR = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const FULL = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK_DAYS = 7;

export class RelativeTime {
  static format(iso: string, now: Date): string {
    const date = new Date(iso);
    const elapsed = Math.max(0, now.getTime() - date.getTime());

    if (elapsed < MINUTE) {
      return 'agora há pouco';
    }

    if (elapsed < HOUR) {
      return RELATIVE.format(-Math.floor(elapsed / MINUTE), 'minute');
    }

    if (elapsed < DAY) {
      return RELATIVE.format(-Math.floor(elapsed / HOUR), 'hour');
    }

    const days = RelativeTime.calendarDays(date, now);

    if (days < WEEK_DAYS) {
      return RELATIVE.format(-days, 'day');
    }

    return (
      date.getFullYear() === now.getFullYear() ? SAME_YEAR : OTHER_YEAR
    ).format(date);
  }

  static full(iso: string): string {
    return FULL.format(new Date(iso));
  }

  // Calendar days, not 24-hour spans: a message from last night is "ontem" this morning.
  private static calendarDays(from: Date, to: Date): number {
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    return Math.round((end.getTime() - start.getTime()) / DAY);
  }
}
