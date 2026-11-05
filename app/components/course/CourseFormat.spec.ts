import { describe, expect, it } from 'vitest';

import { CourseFormat } from '~/components/course/CourseFormat';

describe('CourseFormat.duration', () => {
  it('should write minutes alone, whole hours and hours with minutes', () => {
    expect(CourseFormat.duration(35)).toBe('35 min');
    expect(CourseFormat.duration(60)).toBe('1 h');
    expect(CourseFormat.duration(134)).toBe('2 h 14 min');
  });
});

describe('CourseFormat.count', () => {
  it('should group thousands and pick the singular for one', () => {
    expect(CourseFormat.count(1, 'aluno', 'alunos')).toBe('1 aluno');
    expect(CourseFormat.count(1284, 'aluno', 'alunos')).toBe('1.284 alunos');
  });
});
