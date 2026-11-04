import { redirect } from 'react-router';

import { Resume } from '~/components/lesson/Resume';
import { queryClient } from '~/lib/queryClient';
import { enrollmentQuery } from '~/queries/course';
import { outlineQuery } from '~/queries/lesson';
import { ensureSession } from '~/session/refreshSession';

import type { Route } from './+types/continuar';

// Anything that keeps the lesson from being found (no enrollment, no lessons, a failure) lands
// on the course page, which explains itself.
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const coursePath = `/cursos/${params.id}`;

  // On a cold load this runs beside the root loader, before the session is back: wait for it.
  if (!(await ensureSession())) {
    return redirect(coursePath);
  }

  try {
    const [outline, progress] = await Promise.all([
      queryClient.query(outlineQuery(params.id)),
      // The cached progress may predate the lesson just watched.
      queryClient.query({ ...enrollmentQuery(params.id), staleTime: 0 }),
    ]);
    const point = progress ? Resume.of(outline.modules, progress) : null;

    return redirect(
      point ? `${coursePath}/aulas/${point.lessonId}` : coursePath,
    );
  } catch {
    return redirect(coursePath);
  }
}

export default function ContinueRoute() {
  return null;
}
