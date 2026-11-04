import type { CourseModule } from '~/services/CourseService';
import type { Progress } from '~/services/EnrollmentService';

export interface ResumePoint {
  lessonId: string;
  title: string;
  position: number;
  total: number;
  finished: boolean;
}

export class Resume {
  // The last lesson opened, else the first one not completed, else the first: the course is done.
  static of(modules: CourseModule[], progress: Progress): ResumePoint | null {
    const lessons = modules.flatMap((module) => module.lessons);
    const completed = new Set(progress.completedLessonIds);
    const last = lessons.findIndex(({ id }) => id === progress.lastLessonId);
    const pending = lessons.findIndex(({ id }) => !completed.has(id));
    const finished = pending === -1;
    const index = last !== -1 && !finished ? last : Math.max(pending, 0);
    const lesson = lessons[index];

    if (!lesson) {
      return null;
    }

    return {
      lessonId: lesson.id,
      title: lesson.title,
      position: index + 1,
      total: lessons.length,
      finished,
    };
  }
}
