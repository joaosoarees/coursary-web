import { CourseCard } from '~/components/course/CourseCard';
import { LoadingNote } from '~/components/LoadingNote';
import { Skeleton } from '~/components/ui/skeleton';
import type { CatalogItem } from '~/services/CatalogService';

export function CourseGrid({ courses }: { courses: CatalogItem[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-x-6 gap-y-8">
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  );
}

export function CourseGridSkeleton() {
  return (
    <>
      <LoadingNote>Carregando cursos…</LoadingNote>
      <div
        aria-hidden="true"
        className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-x-6 gap-y-8"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </>
  );
}
