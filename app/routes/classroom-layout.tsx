import { useEffect } from 'react';
import {
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router';

import { AuthGuard } from '~/auth/AuthGuard';
import { ErrorState } from '~/components/ErrorState';
import { ClassroomShell } from '~/components/lesson/ClassroomShell';
import { useOutline } from '~/queries/lesson';

import type { Route } from './+types/classroom-layout';

function Classroom({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard isPrivate>
      <ClassroomFrame>{children}</ClassroomFrame>
    </AuthGuard>
  );
}

function ClassroomFrame({ children }: { children: React.ReactNode }) {
  const { id = '' } = useParams();
  const outline = useOutline(id);
  const preview = useMatch('/instrutor/cursos/:id/aulas/:aulaId/previa');
  // An archived course has no public page; its students reach it from their enrollments.
  const back = preview
    ? `/instrutor/cursos/${id}/aulas/${preview.params.aulaId ?? ''}`
    : outline.data && outline.data.status !== 'PUBLISHED'
      ? '/minhas-matriculas'
      : `/cursos/${id}`;

  return (
    <ClassroomShell
      back={back}
      backLabel={preview ? 'Voltar ao editor' : undefined}
      courseTitle={outline.data?.title}
    >
      {children}
    </ClassroomShell>
  );
}

export default function ClassroomLayout() {
  return (
    <Classroom>
      <Outlet />
    </Classroom>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Classroom>
      <ErrorState
        onRetry={() => {
          // Navigating to the same address clears the error and runs the route again.
          void navigate(location, { replace: true });
        }}
      />
    </Classroom>
  );
}
