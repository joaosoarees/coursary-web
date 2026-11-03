import { Play } from 'lucide-react';

import { CourseFormat } from '~/components/course/CourseFormat';
import type { CourseModule } from '~/services/CourseService';

export function CourseOutline({ modules }: { modules: CourseModule[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {modules.map((module, index) => (
        <li key={module.id} className="flex flex-col gap-2">
          <h3 className="flex justify-between gap-3 font-bold">
            <span>
              {index + 1}. {module.title}
            </span>
            <span className="shrink-0 text-sm font-normal text-muted-foreground">
              {CourseFormat.count(module.lessons.length, 'aula', 'aulas')}
            </span>
          </h3>
          <ol className="flex flex-col border-l">
            {module.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center gap-2.5 py-1.5 pl-4 text-muted-foreground"
              >
                <Play aria-hidden="true" className="size-4 shrink-0" />
                {lesson.title}
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
