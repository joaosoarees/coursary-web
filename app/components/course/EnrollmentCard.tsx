import { Link } from 'react-router';

import { CourseCover } from '~/components/course/CourseCover';
import { CourseProgress } from '~/components/course/CourseProgress';
import { Badge } from '~/components/ui/badge';
import type { EnrollmentSummary } from '~/services/EnrollmentService';

const ARCHIVED_NOTE = 'O instrutor arquivou o curso; seu acesso continua.';

export function EnrollmentCard({
  enrollment,
}: {
  enrollment: EnrollmentSummary;
}) {
  return (
    <Link
      to={`/cursos/${enrollment.courseId}`}
      prefetch="intent"
      className="group flex flex-col gap-5 rounded-md border bg-card p-4 shadow-sm transition-colors hover:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex-row md:items-start"
    >
      <CourseCover
        courseId={enrollment.courseId}
        title={enrollment.title}
        coverUrl={enrollment.coverUrl}
        className="md:w-55 md:shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 self-stretch">
        {enrollment.courseStatus === 'ARCHIVED' && (
          <Badge
            variant="outline"
            title={ARCHIVED_NOTE}
            className="text-muted-foreground"
          >
            Arquivado
            <span className="sr-only">. {ARCHIVED_NOTE}</span>
          </Badge>
        )}
        <h2 className="text-lg leading-snug font-bold group-hover:underline group-hover:underline-offset-4">
          {enrollment.title}
        </h2>
        <span className="text-muted-foreground">
          {enrollment.instructorName}
        </span>
        <div className="pt-1">
          <CourseProgress
            completed={enrollment.completedLessons}
            total={enrollment.lessonCount}
          />
        </div>
      </div>
    </Link>
  );
}
