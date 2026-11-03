import { Link } from 'react-router';

import { CourseCover } from '~/components/course/CourseCover';
import { CourseProgress } from '~/components/course/CourseProgress';
import { Badge } from '~/components/ui/badge';
import type { EnrollmentSummary } from '~/services/EnrollmentService';

export function EnrollmentCard({
  enrollment,
}: {
  enrollment: EnrollmentSummary;
}) {
  return (
    <Link
      to={`/cursos/${enrollment.courseId}`}
      prefetch="intent"
      className="group flex flex-col gap-5 rounded-md border bg-card p-4 shadow-sm transition-colors hover:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex-row"
    >
      <CourseCover
        courseId={enrollment.courseId}
        title={enrollment.title}
        coverUrl={enrollment.coverUrl}
        className="md:w-55 md:shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        {enrollment.courseStatus === 'ARCHIVED' && (
          <Badge variant="outline" className="text-muted-foreground">
            Arquivado
          </Badge>
        )}
        <span className="text-lg leading-snug font-bold group-hover:underline group-hover:underline-offset-4">
          {enrollment.title}
        </span>
        <span className="text-muted-foreground">
          {enrollment.instructorName}
        </span>
        <span className="pt-1">
          <CourseProgress
            completed={enrollment.completedLessons}
            total={enrollment.lessonCount}
          />
        </span>
      </span>
    </Link>
  );
}
