import { Link } from 'react-router';

import { CourseCover } from '~/components/course/CourseCover';
import { CourseProgress } from '~/components/course/CourseProgress';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import type { EnrollmentSummary } from '~/services/EnrollmentService';

const ARCHIVED_NOTE = 'O instrutor arquivou o curso; seu acesso continua.';

export function EnrollmentCard({
  enrollment,
}: {
  enrollment: EnrollmentSummary;
}) {
  return (
    <Link
      to={`/cursos/${enrollment.courseId}/continuar`}
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
          <Badge variant="outline" className="text-muted-foreground">
            {/* The tooltip is for the pointer; screen readers get the sentence once, below. */}
            <span aria-hidden="true" title={ARCHIVED_NOTE}>
              Arquivado
            </span>
            <span className="sr-only">Arquivado. {ARCHIVED_NOTE}</span>
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

export function EnrollmentCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-md border p-4 md:flex-row">
      <Skeleton className="aspect-video w-full md:w-55 md:shrink-0" />
      <div className="flex flex-1 flex-col justify-center gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full max-w-90" />
      </div>
    </div>
  );
}
