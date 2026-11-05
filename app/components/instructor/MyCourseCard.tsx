import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { CourseCover } from '~/components/course/CourseCover';
import { CourseFormat } from '~/components/course/CourseFormat';
import { CourseStatusBadge } from '~/components/instructor/CourseStatusBadge';
import { Skeleton } from '~/components/ui/skeleton';
import type { MyCourse } from '~/services/InstructorService';

export class MyCourseFacts {
  static of(course: MyCourse): string {
    const lessons =
      course.lessonCount === 0
        ? 'Nenhuma aula ainda'
        : CourseFormat.count(course.lessonCount, 'aula', 'aulas');

    if (course.status === 'DRAFT' || !course.publishedAt) {
      return `${lessons} · criado em ${CourseFormat.date(course.createdAt)}`;
    }

    const students = CourseFormat.count(
      course.enrollmentCount,
      'aluno',
      'alunos',
    );

    return `${lessons} · ${students} · publicado em ${CourseFormat.date(course.publishedAt)}`;
  }
}

export function MyCourseCard({ course }: { course: MyCourse }) {
  return (
    <Link
      to={`/instrutor/cursos/${course.id}`}
      prefetch="intent"
      className="group flex flex-col gap-5 rounded-md border bg-card p-3.5 shadow-sm transition-colors hover:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex-row md:items-center"
    >
      <CourseCover
        courseId={course.id}
        title={course.title}
        coverUrl={course.coverUrl}
        className="rounded-sm md:w-44 md:shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <CourseStatusBadge status={course.status} />
        <h2 className="text-lg leading-snug font-bold group-hover:underline group-hover:underline-offset-4">
          {course.title}
        </h2>
        <span className="text-muted-foreground">
          {MyCourseFacts.of(course)}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="hidden items-center gap-1.5 pr-2 font-bold text-link md:inline-flex"
      >
        Editar
        <ChevronRight className="size-4" />
      </span>
    </Link>
  );
}

export function MyCourseCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-md border p-3.5 md:flex-row md:items-center">
      <Skeleton className="aspect-video w-full md:w-44 md:shrink-0" />
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
