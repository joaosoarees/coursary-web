import { Plus } from 'lucide-react';
import { Reorder } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { BoardIcon } from '~/components/BoardIcon';
import { CourseFormat } from '~/components/course/CourseFormat';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { focusLater, focusMark } from '~/instructor/content/contentFocus';
import { ContentOrder } from '~/instructor/content/ContentOrder';
import { ModuleCard } from '~/instructor/content/ModuleCard';
import { ModuleTitleForm } from '~/instructor/content/ModuleTitleForm';
import { useCreateModule, useReorderOutline } from '~/mutations/outline';
import { useOutline } from '~/queries/lesson';
import type { CourseModule } from '~/services/CourseService';
import type { ManagedCourse } from '~/services/InstructorService';

type Modules = CourseModule[];

class ContentFacts {
  static of(modules: Modules): string {
    const lessons = modules.flatMap((module) => module.lessons);
    const minutes = lessons.reduce(
      (sum, lesson) => sum + lesson.durationMinutes,
      0,
    );

    return `${CourseFormat.count(modules.length, 'módulo', 'módulos')} · ${CourseFormat.count(lessons.length, 'aula', 'aulas')} · ${CourseFormat.duration(minutes)}`;
  }
}

export function CourseContent({ course }: { course: ManagedCourse }) {
  const outline = useOutline(course.id);

  return (
    <section aria-labelledby="conteudo" className="flex flex-col gap-4 pt-2">
      {outline.isPending ? (
        <>
          <ContentHeading />
          <LoadingNote>Carregando o conteúdo…</LoadingNote>
          <div aria-hidden="true" className="flex flex-col gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </>
      ) : outline.isError ? (
        <>
          <ContentHeading />
          <ErrorState
            variant="block"
            title="Não deu para carregar o conteúdo"
            onRetry={() => void outline.refetch()}
          />
        </>
      ) : (
        <ContentEditor course={course} modules={outline.data.modules} />
      )}
    </section>
  );
}

function ContentHeading({ facts }: { facts?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2
        id="conteudo"
        className="font-display text-2xl leading-tight font-bold"
      >
        Conteúdo
      </h2>
      <p className="text-muted-foreground">
        {facts ?? 'Módulos e aulas do curso, na ordem em que o aluno vê.'}
      </p>
    </div>
  );
}

function ContentEditor({
  course,
  modules: saved,
}: {
  course: ManagedCourse;
  modules: Modules;
}) {
  const editable = course.status !== 'ARCHIVED';
  const deletable = course.status === 'DRAFT';
  const reorder = useReorderOutline(course.id);
  const create = useCreateModule(course.id);
  const [adding, setAdding] = useState(false);
  // While a drag runs, the order lives here; it is saved once, when the row is dropped.
  const [dragging, setDragging] = useState<Modules | null>(null);
  // What a move did, for screen readers: the rows change place without a word otherwise.
  const [announcement, setAnnouncement] = useState('');
  // Until the optimistic write lands, the order just sent is the one to show, not the saved one.
  const modules =
    dragging ?? (reorder.isPending ? reorder.variables : undefined) ?? saved;

  const save = (next: Modules, said?: string, onSaved?: () => void) => {
    setDragging(null);

    if (ContentOrder.same(next, saved)) {
      return;
    }

    if (said) {
      setAnnouncement(said);
    }

    reorder.mutate(next, { onSuccess: onSaved });
  };
  const lessonPlace = (next: Modules, lessonId: string) => {
    const module = next.find((each) =>
      each.lessons.some((lesson) => lesson.id === lessonId),
    );
    const index =
      module?.lessons.findIndex((lesson) => lesson.id === lessonId) ?? -1;
    const lesson = module?.lessons[index];

    return module && lesson
      ? `${lesson.title} agora é a aula ${String(index + 1)} de ${module.title}.`
      : '';
  };
  const finishDrag = () => {
    if (dragging) {
      save(dragging);
    }
  };

  const firstNumbers = ContentOrder.firstNumbers(modules);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <ContentHeading
          facts={
            modules.length === 0
              ? undefined
              : `${ContentFacts.of(modules)}.${editable ? ' Arraste ou use as setas para mudar a ordem.' : ''}`
          }
        />
        {editable && modules.length > 0 && !adding && (
          <Button
            variant="outline"
            onClick={() => {
              setAdding(true);
            }}
            {...focusMark('content-new-module')}
          >
            <Plus aria-hidden="true" />
            Novo módulo
          </Button>
        )}
      </div>
      {course.status === 'PUBLISHED' && (
        <p className="text-muted-foreground">
          Num curso publicado, aulas e módulos não podem ser apagados; renomear,
          editar e reordenar continuam.
        </p>
      )}
      {modules.length === 0 && !adding && (
        <EmptyState
          icon={BoardIcon}
          headingLevel="h3"
          title="Nenhum módulo ainda"
          description="Um curso é feito de módulos, e cada módulo, de aulas. Comece pelo primeiro módulo."
          action={
            editable && (
              <Button
                onClick={() => {
                  setAdding(true);
                }}
                {...focusMark('content-new-module')}
              >
                <Plus aria-hidden="true" />
                Criar o primeiro módulo
              </Button>
            )
          }
        />
      )}
      <Reorder.Group
        axis="y"
        values={modules}
        onReorder={setDragging}
        className="flex flex-col gap-4"
      >
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            courseId={course.id}
            module={module}
            number={index + 1}
            firstLessonNumber={firstNumbers[index] ?? 1}
            first={index === 0}
            last={index === modules.length - 1}
            editable={editable}
            deletable={deletable}
            otherModules={modules
              .filter((other) => other.id !== module.id)
              .map(({ id, title }) => ({ id, title }))}
            onMove={(offset) => {
              const next = ContentOrder.moveModule(modules, module.id, offset);
              save(
                next,
                `${module.title} agora é o módulo ${String(next.indexOf(module) + 1)}.`,
              );
            }}
            onLessonsReorder={(lessons) => {
              setDragging(
                ContentOrder.withLessons(modules, module.id, lessons),
              );
            }}
            onMoveLesson={(lessonId, offset) => {
              const next = ContentOrder.moveLesson(modules, lessonId, offset);
              save(next, lessonPlace(next, lessonId));
            }}
            onMoveLessonTo={(lessonId, moduleId) => {
              const target = modules.find((each) => each.id === moduleId);
              save(
                ContentOrder.moveLessonTo(modules, lessonId, moduleId),
                undefined,
                () => {
                  toast.success(
                    `Aula movida para o fim de ${target?.title ?? 'outro módulo'}.`,
                  );
                },
              );
            }}
            onDragEnd={finishDrag}
          />
        ))}
      </Reorder.Group>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {adding && (
        <div className="rounded-lg border border-dashed border-input p-4">
          <ModuleTitleForm
            submitLabel="Criar módulo"
            pendingLabel="Criando…"
            onSave={async (title) => {
              const module = await create.mutateAsync(title);
              setAdding(false);
              toast.success('Módulo criado.');
              focusLater(`module-add-${module.id}`);
            }}
            onCancel={() => {
              setAdding(false);
              focusLater('content-new-module');
            }}
          />
        </div>
      )}
    </>
  );
}
