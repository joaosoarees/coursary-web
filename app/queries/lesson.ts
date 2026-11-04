import { queryOptions, useQuery } from '@tanstack/react-query';

import { LessonService } from '~/services/LessonService';

const FRESH_FOR = 30_000;

export const outlineQuery = (courseId: string) =>
  queryOptions({
    queryKey: ['courses', courseId, 'outline'],
    queryFn: ({ signal }) => LessonService.outline(courseId, signal),
    staleTime: FRESH_FOR,
  });

// Every answer signs a new video address, and a new address reloads the player from the start:
// only the player asks again, when its address is about to expire.
export const lessonQuery = (courseId: string, lessonId: string) =>
  queryOptions({
    queryKey: ['courses', courseId, 'lessons', lessonId],
    queryFn: ({ signal }) => LessonService.open({ courseId, lessonId }, signal),
    staleTime: FRESH_FOR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useOutline = (courseId: string) =>
  useQuery(outlineQuery(courseId));

export const useLesson = (courseId: string, lessonId: string) =>
  useQuery(lessonQuery(courseId, lessonId));
