const RATING = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

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
    return `${String(count)} ${count === 1 ? one : many}`;
  }

  static date(iso: string): string {
    return DATE.format(new Date(iso));
  }
}
