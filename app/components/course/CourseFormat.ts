const RATING = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const INTEGER = new Intl.NumberFormat('pt-BR');

const DATE = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export class CourseFormat {
  static rating(average: number): string {
    return RATING.format(average);
  }

  static count(count: number, one: string, many: string): string {
    return `${INTEGER.format(count)} ${count === 1 ? one : many}`;
  }

  static duration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours === 0) {
      return `${String(rest)} min`;
    }

    return rest === 0
      ? `${String(hours)} h`
      : `${String(hours)} h ${String(rest)} min`;
  }

  static date(iso: string): string {
    return DATE.format(new Date(iso));
  }
}
