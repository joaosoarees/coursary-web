import type { CourseModule } from '~/services/CourseService';

type Modules = CourseModule[];

const swap = <T>(items: T[], index: number, offset: -1 | 1): T[] => {
  const target = index + offset;

  if (target < 0 || target >= items.length) {
    return items;
  }

  const next = [...items];
  [next[index], next[target]] = [next[target] as T, next[index] as T];

  return next;
};

export class ContentOrder {
  static swap<T>(items: T[], index: number, offset: -1 | 1): T[] {
    return swap(items, index, offset);
  }

  static moveModule(modules: Modules, moduleId: string, offset: -1 | 1) {
    return swap(
      modules,
      modules.findIndex((module) => module.id === moduleId),
      offset,
    );
  }

  static moveLesson(modules: Modules, lessonId: string, offset: -1 | 1) {
    return modules.map((module) => {
      const index = module.lessons.findIndex(
        (lesson) => lesson.id === lessonId,
      );

      return index === -1
        ? module
        : { ...module, lessons: swap(module.lessons, index, offset) };
    });
  }

  // The lesson goes to the end of the other module.
  static moveLessonTo(modules: Modules, lessonId: string, moduleId: string) {
    const lesson = modules
      .flatMap((module) => module.lessons)
      .find((each) => each.id === lessonId);

    if (!lesson) {
      return modules;
    }

    return modules.map((module) => {
      const rest = module.lessons.filter((each) => each.id !== lessonId);

      return module.id === moduleId
        ? { ...module, lessons: [...rest, lesson] }
        : { ...module, lessons: rest };
    });
  }

  static withLessons(
    modules: Modules,
    moduleId: string,
    lessons: CourseModule['lessons'],
  ) {
    return modules.map((module) =>
      module.id === moduleId ? { ...module, lessons } : module,
    );
  }

  // The number of each module's first lesson: lessons are numbered across the whole course.
  static firstNumbers(modules: Modules): number[] {
    return modules.reduce<number[]>(
      (starts, module, index) => [
        ...starts,
        index === 0
          ? 1
          : (starts[index - 1] ?? 1) +
            (modules[index - 1]?.lessons.length ?? 0),
      ],
      [],
    );
  }

  static same(left: Modules, right: Modules) {
    const ids = (modules: Modules) =>
      modules
        .map(
          (module) =>
            `${module.id}:${module.lessons.map((lesson) => lesson.id).join(',')}`,
        )
        .join('|');

    return ids(left) === ids(right);
  }
}
