import { Star } from 'lucide-react';
import { Link } from 'react-router';

import { CourseCover } from '~/components/course/CourseCover';
import { CourseFormat } from '~/components/course/CourseFormat';
import type { CatalogItem } from '~/services/CatalogService';

export function CourseCard({ course }: { course: CatalogItem }) {
  return (
    <Link
      to={`/cursos/${course.id}`}
      prefetch="intent"
      className="group flex flex-col gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <CourseCover
        courseId={course.id}
        title={course.title}
        coverUrl={course.coverUrl}
      />
      <span className="flex flex-col gap-1">
        <span className="text-lg leading-snug font-bold group-hover:underline group-hover:underline-offset-4">
          {course.title}
        </span>
        <span className="text-muted-foreground">{course.instructorName}</span>
        <span className="flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-muted-foreground">
          {course.ratingAverage === null ? (
            <span>Sem avaliações</span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Star aria-hidden="true" className="size-4 fill-current" />
              <span>
                <span className="sr-only">Nota </span>
                {CourseFormat.rating(course.ratingAverage)} (
                {course.ratingCount})
              </span>
            </span>
          )}
          <span>{CourseFormat.count(course.lessonCount, 'aula', 'aulas')}</span>
          <span>
            {CourseFormat.count(course.enrollmentCount, 'aluno', 'alunos')}
          </span>
        </span>
      </span>
    </Link>
  );
}
