import { describe, expect, it } from 'vitest';

import { RelativeTime } from '~/components/questions/RelativeTime';

const now = new Date(2026, 10, 10, 9, 30);
const at = (...parts: [number, number, number, number, number]) =>
  new Date(...parts).toISOString();

describe('RelativeTime.format', () => {
  it('should say "agora há pouco" under a minute, and in the future', () => {
    expect(RelativeTime.format(at(2026, 10, 10, 9, 29), now)).toBe(
      'há 1 minuto',
    );
    expect(RelativeTime.format(now.toISOString(), now)).toBe('agora há pouco');
    expect(RelativeTime.format(at(2026, 10, 10, 9, 31), now)).toBe(
      'agora há pouco',
    );
  });

  it('should count minutes, then hours', () => {
    expect(RelativeTime.format(at(2026, 10, 10, 9, 0), now)).toBe(
      'há 30 minutos',
    );
    expect(RelativeTime.format(at(2026, 10, 10, 7, 15), now)).toBe(
      'há 2 horas',
    );
  });

  it('should count calendar days after a day', () => {
    expect(RelativeTime.format(at(2026, 10, 9, 8, 0), now)).toBe('ontem');
    expect(RelativeTime.format(at(2026, 10, 7, 23, 0), now)).toBe('há 3 dias');
  });

  it('should show the date after a week, with the year only when it is another', () => {
    expect(RelativeTime.format(at(2026, 9, 12, 10, 0), now)).toBe('12 de out.');
    expect(RelativeTime.format(at(2025, 11, 30, 10, 0), now)).toBe(
      '30 de dez. de 2025',
    );
  });
});

describe('RelativeTime.full', () => {
  it('should write the date and the time in full', () => {
    expect(RelativeTime.full(at(2026, 10, 10, 14, 12))).toBe(
      '10 de novembro de 2026 às 14:12',
    );
  });
});
