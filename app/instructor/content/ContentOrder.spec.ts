import { describe, expect, it } from 'vitest';

import { ContentOrder } from '~/instructor/content/ContentOrder';
import type { CourseModule } from '~/services/CourseService';

const lesson = (id: string) => ({
  id,
  title: id,
  durationMinutes: 5,
  position: 0,
});

const modules: CourseModule[] = [
  { id: 'm1', title: 'M1', position: 0, lessons: [lesson('a'), lesson('b')] },
  { id: 'm2', title: 'M2', position: 1, lessons: [lesson('c')] },
];

const ids = (list: CourseModule[]) =>
  list.map((module) => [module.id, module.lessons.map((each) => each.id)]);

describe('ContentOrder', () => {
  it('should move a module and keep the ends in place', () => {
    expect(ids(ContentOrder.moveModule(modules, 'm2', -1))).toEqual([
      ['m2', ['c']],
      ['m1', ['a', 'b']],
    ]);
    expect(ContentOrder.moveModule(modules, 'm1', -1)).toBe(modules);
  });

  it('should move a lesson inside its module', () => {
    expect(ids(ContentOrder.moveLesson(modules, 'b', -1))).toEqual([
      ['m1', ['b', 'a']],
      ['m2', ['c']],
    ]);
  });

  it('should move a lesson to the end of another module', () => {
    expect(ids(ContentOrder.moveLessonTo(modules, 'a', 'm2'))).toEqual([
      ['m1', ['b']],
      ['m2', ['c', 'a']],
    ]);
  });

  it('should tell two orders apart by their ids', () => {
    expect(ContentOrder.same(modules, [...modules])).toBe(true);
    expect(
      ContentOrder.same(modules, ContentOrder.moveLesson(modules, 'a', 1)),
    ).toBe(false);
  });
});
