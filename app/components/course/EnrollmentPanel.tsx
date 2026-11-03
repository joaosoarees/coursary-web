import { Check, Clock } from 'lucide-react';
import { useState } from 'react';

import { CourseCover } from '~/components/course/CourseCover';
import { ErrorState } from '~/components/ErrorState';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Skeleton } from '~/components/ui/skeleton';
import { FormAlert } from '~/components/visitor/FormMessage';
import { useCancelEnrollment, useEnroll } from '~/mutations/enrollment';
import { useEnrollment } from '~/queries/course';
import { ApiFailure } from '~/services/ApiFailure';
import type { CoursePage } from '~/services/CourseService';

const ENROLL_FAILURES = {
  OWN_COURSE: 'Você é o instrutor deste curso.',
  COURSE_ARCHIVED: 'Este curso não aceita matrículas novas.',
};

export function EnrollmentPanel({ course }: { course: CoursePage }) {
  return (
    <aside
      aria-label="Matrícula"
      className="flex flex-col gap-4 rounded-md border bg-card p-4 shadow-sm"
    >
      <CourseCover
        courseId={course.id}
        title={course.title}
        coverUrl={course.coverUrl}
        large
      />
      <EnrollmentAction course={course} />
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock aria-hidden="true" className="size-4 shrink-0" />
        Estude no seu ritmo; o progresso fica salvo aula a aula.
      </p>
    </aside>
  );
}

function EnrollmentAction({ course }: { course: CoursePage }) {
  const enrollment = useEnrollment(course.id);
  const enroll = useEnroll();

  if (enrollment.isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (enrollment.isLoadingError) {
    return (
      <ErrorState
        variant="block"
        title="Não deu para ver sua matrícula"
        onRetry={() => void enrollment.refetch()}
      />
    );
  }

  if (enrollment.data) {
    return <Enrolled course={course} />;
  }

  const ownCourse = ApiFailure.codeOf(enroll.error) === 'OWN_COURSE';

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        className="h-12"
        disabled={enroll.isPending || ownCourse}
        onClick={() => {
          enroll.mutate(course.id);
        }}
      >
        {enroll.isPending ? 'Matriculando…' : 'Matricular-me'}
      </Button>
      {ownCourse ? (
        <p role="alert" className="text-sm text-muted-foreground">
          {ENROLL_FAILURES.OWN_COURSE}
        </p>
      ) : (
        enroll.error && (
          <FormAlert>
            {ApiFailure.message(enroll.error, ENROLL_FAILURES)}
          </FormAlert>
        )
      )}
    </div>
  );
}

function Enrolled({ course }: { course: CoursePage }) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelEnrollment();

  return (
    <div className="flex flex-col gap-2.5">
      <div
        role="status"
        className="flex items-center gap-2.5 rounded-md bg-success-soft px-3.5 py-3 font-bold text-success"
      >
        <Check aria-hidden="true" className="size-4.5 shrink-0" />
        Você está matriculado
      </div>
      <Dialog
        open={confirming}
        onOpenChange={(open) => {
          if (cancel.isPending) {
            return;
          }

          setConfirming(open);
          cancel.reset();
        }}
      >
        <Button
          variant="ghost"
          className="text-destructive not-disabled:hover:text-destructive"
          onClick={() => {
            setConfirming(true);
          }}
        >
          Cancelar matrícula
        </Button>
        <DialogContent showCloseButton={false} className="sm:max-w-[30rem]">
          <DialogHeader className="gap-4">
            <DialogTitle>Cancelar a matrícula?</DialogTitle>
            <DialogDescription className="text-base">
              Você deixa de ver as aulas de “{course.title}”. Seu progresso fica
              guardado se você se matricular de novo.
            </DialogDescription>
          </DialogHeader>
          {cancel.error && (
            <FormAlert>{ApiFailure.message(cancel.error)}</FormAlert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={cancel.isPending}
              onClick={() => {
                setConfirming(false);
              }}
            >
              Manter matrícula
            </Button>
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() => {
                cancel.mutate(course.id, {
                  onSuccess: () => {
                    setConfirming(false);
                  },
                });
              }}
            >
              {cancel.isPending ? 'Cancelando…' : 'Cancelar matrícula'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
