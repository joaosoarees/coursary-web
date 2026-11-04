import { noop } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { CourseFormat } from '~/components/course/CourseFormat';
import { CourseOutline } from '~/components/course/CourseOutline';
import { CourseRating } from '~/components/course/CourseRating';
import { EnrollmentPanel } from '~/components/course/EnrollmentPanel';
import { ReviewList } from '~/components/course/ReviewList';
import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { Skeleton } from '~/components/ui/skeleton';
import { queryClient } from '~/lib/queryClient';
import {
  courseQuery,
  enrollmentQuery,
  myReviewQuery,
  reviewsQuery,
  useCourse,
  useEnrollment,
} from '~/queries/course';
import { ApiFailure } from '~/services/ApiFailure';
import type { CoursePage } from '~/services/CourseService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/curso';

// A malformed id is refused as a validation error before the API looks for the course.
const NOT_FOUND = new Set(['COURSE_NOT_FOUND', 'VALIDATION']);

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: `${loaderData?.title ?? 'Curso'} · Coursary` },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!isSignedIn()) {
    return null;
  }

  void queryClient.query(enrollmentQuery(params.id)).catch(noop);
  void queryClient.query(myReviewQuery(params.id)).catch(noop);
  void queryClient.infiniteQuery(reviewsQuery(params.id)).catch(noop);
  const course = await queryClient.query(courseQuery(params.id)).catch(noop);

  return { title: course?.title };
}

export default function CoursePageRoute({ params }: Route.ComponentProps) {
  const { data, isLoading, isLoadingError, error, refetch } = useCourse(
    params.id,
  );

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (isLoadingError) {
    const code = ApiFailure.codeOf(error);

    return code !== undefined && NOT_FOUND.has(code) ? (
      <ErrorState
        title="Curso não encontrado"
        message="O endereço não corresponde a nenhum curso publicado."
      />
    ) : (
      <ErrorState onRetry={() => void refetch()} />
    );
  }

  return data ? <CourseDetails course={data} /> : null;
}

const outlineSummary = (course: CoursePage) => {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const minutes = lessons.reduce(
    (sum, lesson) => sum + lesson.durationMinutes,
    0,
  );

  return `${CourseFormat.count(lessons.length, 'aula', 'aulas')} · ${CourseFormat.duration(minutes)}`;
};

function CourseDetails({ course }: { course: CoursePage }) {
  const enrollment = useEnrollment(course.id);

  return (
    <article className="flex flex-col gap-8">
      <Link
        to="/cursos"
        className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-md font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronLeft aria-hidden="true" className="size-4.5" />
        Catálogo
      </Link>
      <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <header className="flex min-w-0 flex-col gap-3 lg:col-start-1">
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance md:text-4xl">
            {course.title}
          </h1>
          <p className="text-muted-foreground">Com {course.instructorName}</p>
          <p className="flex flex-wrap gap-x-4.5 gap-y-1.5 text-sm text-muted-foreground">
            <CourseRating
              average={course.ratingAverage}
              count={course.ratingCount}
            />
            <span>
              {CourseFormat.count(course.lessonCount, 'aula', 'aulas')} em{' '}
              {CourseFormat.count(course.modules.length, 'módulo', 'módulos')}
            </span>
            <span>
              {CourseFormat.count(course.enrollmentCount, 'aluno', 'alunos')}
            </span>
          </p>
        </header>
        <EnrollmentPanel
          course={course}
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
        />
        <div className="flex min-w-0 flex-col gap-8 lg:col-start-1">
          <Section title="Sobre o curso">
            <p className="max-w-prose whitespace-pre-line">
              {course.description}
            </p>
          </Section>
          <Section title="Conteúdo" detail={outlineSummary(course)}>
            <CourseOutline
              courseId={course.id}
              modules={course.modules}
              progress={enrollment.data}
            />
          </Section>
          <Section title="Avaliações">
            <ReviewList courseId={course.id} />
          </Section>
        </div>
      </div>
    </article>
  );
}

function Section({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {detail && (
          <span className="text-sm text-muted-foreground">{detail}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function CourseSkeleton() {
  return (
    <>
      <LoadingNote>Carregando o curso…</LoadingNote>
      <div
        aria-hidden="true"
        className="grid items-start gap-10 pt-18 lg:grid-cols-[minmax(0,1fr)_21.25rem]"
      >
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="aspect-video w-full" />
      </div>
    </>
  );
}
