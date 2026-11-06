import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managedCourseQuery } from '~/queries/instructor';
import { lessonQuery, outlineQuery } from '~/queries/lesson';
import type { CourseModule } from '~/services/CourseService';
import type { CourseOutline, LessonContent } from '~/services/LessonService';
import { OutlineService } from '~/services/OutlineService';

type Modules = CourseModule[];

const useOutlineWriter = (courseId: string) => {
  const queryClient = useQueryClient();
  const key = outlineQuery(courseId).queryKey;

  return {
    queryClient,
    key,
    write: (change: (modules: Modules) => Modules) => {
      queryClient.setQueryData<CourseOutline>(key, (outline) =>
        outline ? { ...outline, modules: change(outline.modules) } : outline,
      );
    },
    // The lesson count drives "Publicar" and the facts line of the course.
    countChanged: () => {
      void queryClient.invalidateQueries({
        queryKey: managedCourseQuery(courseId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: ['courses'],
        refetchType: 'none',
      });
    },
  };
};

export const useCreateModule = (courseId: string) => {
  const { write } = useOutlineWriter(courseId);

  return useMutation({
    mutationFn: (title: string) => OutlineService.createModule(courseId, title),
    onSuccess: (module) => {
      write((modules) => [...modules, { ...module, lessons: [] }]);
    },
  });
};

export const useRenameModule = (courseId: string, moduleId: string) => {
  const { write } = useOutlineWriter(courseId);

  return useMutation({
    mutationFn: (title: string) =>
      OutlineService.renameModule(courseId, moduleId, title),
    onSuccess: ({ title }) => {
      write((modules) =>
        modules.map((module) =>
          module.id === moduleId ? { ...module, title } : module,
        ),
      );
    },
  });
};

export const useDeleteModule = (courseId: string, moduleId: string) => {
  const { write } = useOutlineWriter(courseId);

  return useMutation({
    mutationFn: () => OutlineService.deleteModule(courseId, moduleId),
    onSuccess: () => {
      write((modules) => modules.filter((module) => module.id !== moduleId));
    },
  });
};

export const useCreateLesson = (courseId: string, moduleId: string) => {
  const { write, countChanged } = useOutlineWriter(courseId);

  return useMutation({
    mutationFn: (lesson: { title: string; durationMinutes: number }) =>
      OutlineService.createLesson(courseId, moduleId, lesson),
    onSuccess: ({ id, title, durationMinutes, position }) => {
      write((modules) =>
        modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: [
                  ...module.lessons,
                  { id, title, durationMinutes, position },
                ],
              }
            : module,
        ),
      );
      countChanged();
    },
  });
};

export const useUpdateLesson = (
  courseId: string,
  moduleId: string,
  lessonId: string,
) => {
  const { queryClient, write } = useOutlineWriter(courseId);

  return useMutation({
    mutationFn: (lesson: {
      title: string;
      body: string;
      durationMinutes: number;
    }) => OutlineService.updateLesson(courseId, moduleId, lessonId, lesson),
    onSuccess: ({ title, body, durationMinutes }) => {
      // The course page and the classroom show the title and the duration too. Marked before the
      // writes below, so the two queries written here are not marked with them.
      void queryClient.invalidateQueries({
        queryKey: ['courses'],
        refetchType: 'none',
      });
      write((modules) =>
        modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, title, durationMinutes }
              : lesson,
          ),
        })),
      );
      queryClient.setQueryData<LessonContent>(
        lessonQuery(courseId, lessonId).queryKey,
        (content) => (content ? { ...content, body } : content),
      );
    },
  });
};

export const useDeleteLesson = (courseId: string, moduleId: string) => {
  const { write, countChanged } = useOutlineWriter(courseId);

  return useMutation({
    mutationFn: (lessonId: string) =>
      OutlineService.deleteLesson(courseId, moduleId, lessonId),
    onSuccess: (_, lessonId) => {
      write((modules) =>
        modules.map((module) => ({
          ...module,
          lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
        })),
      );
      countChanged();
    },
  });
};

// Reordering has a way back, so the new order shows at once and is undone if the API refuses it.
// The requests run one after the other, and only the last answer is written over the screen.
export const useReorderOutline = (courseId: string) => {
  const { queryClient, key, write } = useOutlineWriter(courseId);
  const mutationKey = ['outline-order', courseId];

  return useMutation({
    mutationKey,
    scope: { id: `outline-order-${courseId}` },
    mutationFn: (modules: Modules) =>
      OutlineService.reorder(courseId, {
        modules: modules.map((module) => ({
          id: module.id,
          lessonIds: module.lessons.map((lesson) => lesson.id),
        })),
      }),
    onMutate: async (modules) => {
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData<CourseOutline>(key);
      write(() => modules);

      return { before };
    },
    onError: (_error, _modules, context) => {
      if (context?.before) {
        queryClient.setQueryData(key, context.before);
      }

      // One id, so quick moves that all fail leave one notice, not a stack of the same one.
      toast.error('Não deu para salvar a nova ordem. Ela voltou ao que era.', {
        id: 'outline-order-failed',
      });
    },
    onSuccess: (modules) => {
      if (queryClient.isMutating({ mutationKey }) !== 1) {
        return;
      }

      // A module or lesson created while this request ran is not in its answer: ask again then.
      const ids = (list: Modules) =>
        list.flatMap((module) => [
          module.id,
          ...module.lessons.map((lesson) => lesson.id),
        ]);
      const answered = new Set(ids(modules));
      const cached = queryClient.getQueryData<CourseOutline>(key);

      if (cached && ids(cached.modules).some((id) => !answered.has(id))) {
        void queryClient.invalidateQueries({ queryKey: key });
      } else {
        write(() => modules);
      }
    },
  });
};
