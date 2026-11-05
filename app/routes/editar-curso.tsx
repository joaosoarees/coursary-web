import { noop } from '@tanstack/react-query';
import { Archive } from 'lucide-react';
import { toast } from 'sonner';

import { CourseFormat } from '~/components/course/CourseFormat';
import { ErrorState } from '~/components/ErrorState';
import { CourseStatusBadge } from '~/components/instructor/CourseStatusBadge';
import { MyCourseFacts } from '~/components/instructor/MyCourseCard';
import { LoadingNote } from '~/components/LoadingNote';
import { Skeleton } from '~/components/ui/skeleton';
import { BackToMyCourses } from '~/instructor/BackToMyCourses';
import { CourseActions } from '~/instructor/CourseActions';
import { CourseInfoForm } from '~/instructor/CourseInfoForm';
import { CoverCard } from '~/instructor/CoverCard';
import { queryClient } from '~/lib/queryClient';
import { useUpdateCourse } from '~/mutations/instructor';
import { managedCourseQuery, useManagedCourse } from '~/queries/instructor';
import { ApiFailure } from '~/services/ApiFailure';
import type { ManagedCourse } from '~/services/InstructorService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/editar-curso';

// Another instructor's draft is a 404 and a malformed id a validation error; the API refuses
// another instructor's published course with a 403. None of them is this person's course.
const NOT_MINE = new Set(['COURSE_NOT_FOUND', 'VALIDATION', 'FORBIDDEN']);

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: `${loaderData?.title ?? 'Editar curso'} · Coursary` },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!isSignedIn()) {
    return null;
  }

  const course = await queryClient
    .query(managedCourseQuery(params.id))
    .catch(noop);

  return { title: course?.title };
}

export default function EditCoursePage({ params }: Route.ComponentProps) {
  const { data, isLoading, isLoadingError, error, refetch } = useManagedCourse(
    params.id,
  );

  return (
    <section className="flex flex-col gap-6">
      <BackToMyCourses />
      {isLoading ? (
        <EditorSkeleton />
      ) : isLoadingError ? (
        NOT_MINE.has(ApiFailure.codeOf(error) ?? '') ? (
          <ErrorState
            title="Curso não encontrado"
            message="O endereço não corresponde a nenhum curso seu."
            back={{ to: '/instrutor/cursos', label: 'Ir para Meus cursos' }}
          />
        ) : (
          <ErrorState onRetry={() => void refetch()} />
        )
      ) : (
        data && <CourseEditor course={data} />
      )}
    </section>
  );
}

function CourseEditor({ course }: { course: ManagedCourse }) {
  const update = useUpdateCourse(course.id);
  const archived = course.status === 'ARCHIVED';

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-[1_1_26rem] flex-col gap-2">
          <CourseStatusBadge status={course.status} />
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance md:text-4xl">
            {course.title}
          </h1>
          <p className="text-muted-foreground">{MyCourseFacts.of(course)}</p>
        </div>
        <CourseActions course={course} />
      </header>
      {archived && (
        <div
          role="note"
          className="flex max-w-prose items-start gap-3 rounded-lg border bg-muted px-5 py-4"
        >
          <Archive aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Saiu do catálogo e da busca;{' '}
            {course.enrollmentCount === 1
              ? 'o aluno matriculado continua'
              : `os ${CourseFormat.count(course.enrollmentCount, 'aluno', 'alunos')} matriculados continuam`}{' '}
            com acesso. Não pode mais ser editado nem publicado.
          </p>
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="informacoes"
          className="flex flex-col gap-5 rounded-lg border bg-card p-5 text-card-foreground shadow-sm md:p-7"
        >
          <h2 id="informacoes" className="font-display text-xl font-bold">
            Informações
          </h2>
          <CourseInfoForm
            saved={{ title: course.title, description: course.description }}
            readOnly={archived}
            submitLabel="Salvar alterações"
            pendingLabel="Salvando…"
            onSave={async (info) => {
              await update.mutateAsync(info);
              toast.success('Alterações salvas.');
            }}
          />
        </section>
        <CoverCard course={course} readOnly={archived} />
      </div>
    </>
  );
}

function EditorSkeleton() {
  return (
    <>
      <LoadingNote>Carregando o curso…</LoadingNote>
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Skeleton className="h-96" />
          <Skeleton className="h-80" />
        </div>
      </div>
    </>
  );
}
