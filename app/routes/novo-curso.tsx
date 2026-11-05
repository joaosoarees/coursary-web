import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/ui/button';
import { BackToMyCourses } from '~/instructor/BackToMyCourses';
import { CourseInfoForm } from '~/instructor/CourseInfoForm';
import { useCreateCourse } from '~/mutations/instructor';

import type { Route } from './+types/novo-curso';

export const meta: Route.MetaFunction = () => [
  { title: 'Novo curso · Coursary' },
];

export default function NewCoursePage() {
  const create = useCreateCourse();
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-6">
      <BackToMyCourses />
      <PageHeader
        title="Novo curso"
        description="O curso começa como rascunho, visível só para você. Depois de criar, você envia a capa e, quando houver aulas, publica."
      />
      <div className="max-w-180 rounded-lg border bg-card p-5 text-card-foreground shadow-sm md:p-7">
        <CourseInfoForm
          submitLabel="Criar rascunho"
          pendingLabel="Criando…"
          onSave={async (info) => {
            const course = await create.mutateAsync(info);
            toast.success('Rascunho criado.');
            await navigate(`/instrutor/cursos/${course.id}`, { replace: true });
          }}
          actions={
            <Button variant="outline" asChild>
              <Link to="/instrutor/cursos">Cancelar</Link>
            </Button>
          }
        />
      </div>
    </section>
  );
}
