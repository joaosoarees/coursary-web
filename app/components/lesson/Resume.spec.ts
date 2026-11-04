import { describe, expect, it } from 'vitest';

import { Resume } from '~/components/lesson/Resume';
import type { CourseModule } from '~/services/CourseService';
import type { Progress } from '~/services/EnrollmentService';

const lesson = (id: string, position: number) => ({
  id,
  title: `Aula ${id}`,
  durationMinutes: 10,
  position,
});

const modules: CourseModule[] = [
  {
    id: 'm1',
    title: 'Um',
    position: 0,
    lessons: [lesson('l1', 0), lesson('l2', 1)],
  },
  { id: 'm2', title: 'Dois', position: 1, lessons: [lesson('l3', 0)] },
];

const progress = (changes: Partial<Progress>): Progress => ({
  completedLessons: 0,
  completedLessonIds: [],
  lastLessonId: null,
  positionSeconds: null,
  ...changes,
});

describe('Resume.of', () => {
  it('should go back to the last lesson opened', () => {
    expect(
      Resume.of(
        modules,
        progress({ completedLessonIds: ['l1'], lastLessonId: 'l3' }),
      ),
    ).toEqual({
      lessonId: 'l3',
      title: 'Aula l3',
      position: 3,
      total: 3,
      finished: false,
    });
  });

  it('should start at the first lesson not completed when none was opened', () => {
    expect(
      Resume.of(modules, progress({ completedLessonIds: ['l1'] }))?.lessonId,
    ).toBe('l2');
  });

  it('should skip a last lesson that left the course', () => {
    expect(
      Resume.of(modules, progress({ lastLessonId: 'gone' }))?.lessonId,
    ).toBe('l1');
  });

  it('should start over at the first lesson of a finished course', () => {
    expect(
      Resume.of(
        modules,
        progress({
          completedLessonIds: ['l1', 'l2', 'l3'],
          lastLessonId: 'l2',
        }),
      ),
    ).toMatchObject({ lessonId: 'l1', position: 1, finished: true });
  });

  it('should have nothing to resume in a course without lessons', () => {
    expect(Resume.of([], progress({}))).toBeNull();
  });
});
