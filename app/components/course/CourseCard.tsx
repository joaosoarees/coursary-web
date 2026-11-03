import { Link } from 'react-router';

import { CourseCover } from '~/components/course/CourseCover';
import { CourseFormat } from '~/components/course/CourseFormat';
import { CourseRating } from '~/components/course/CourseRating';
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
          <CourseRating
            average={course.ratingAverage}
            count={course.ratingCount}
          />
          <span>{CourseFormat.count(course.lessonCount, 'aula', 'aulas')}</span>
          <span>
            {CourseFormat.count(course.enrollmentCount, 'aluno', 'alunos')}
          </span>
        </span>
      </span>
    </Link>
  );
}
