import type { CatalogItem } from '~/services/CatalogService';
import type { CourseModule, Review } from '~/services/CourseService';
import type { EnrollmentSummary, Progress } from '~/services/EnrollmentService';
import type { MyCourse } from '~/services/InstructorService';
import type { Notification } from '~/services/NotificationService';
import type { MyReview } from '~/services/ReviewService';

export const typescriptCourse: CatalogItem = {
  id: 'c-3',
  title: 'TypeScript do zero',
  instructorName: 'Bruno Costa',
  lessonCount: 12,
  enrollmentCount: 1284,
  ratingCount: 128,
  ratingAverage: 4.6,
  publishedAt: '2026-09-02T12:00:00.000Z',
};

export const reactCourse: CatalogItem = {
  id: 'c-1',
  title: 'React com testes',
  instructorName: 'Carla Mendes',
  lessonCount: 24,
  enrollmentCount: 312,
  ratingCount: 41,
  ratingAverage: 4.8,
  publishedAt: '2026-10-11T12:00:00.000Z',
};

export const newCourse: CatalogItem = {
  id: 'c-2',
  title: 'Design de APIs REST na prática',
  instructorName: 'Diego Alves',
  lessonCount: 1,
  enrollmentCount: 1,
  ratingCount: 0,
  ratingAverage: null,
  publishedAt: '2026-11-10T12:00:00.000Z',
};

export const enrollment: EnrollmentSummary = {
  courseId: 'c-3',
  title: 'TypeScript do zero',
  instructorName: 'Bruno Costa',
  lessonCount: 12,
  completedLessons: 5,
  enrolledAt: '2026-10-01T12:00:00.000Z',
  courseStatus: 'PUBLISHED',
};

export const myCourse: MyCourse = {
  id: 'c-3',
  title: 'TypeScript do zero',
  status: 'PUBLISHED',
  lessonCount: 12,
  enrollmentCount: 1284,
  publishedAt: '2026-09-02T12:00:00.000Z',
  createdAt: '2026-08-20T12:00:00.000Z',
};

const lesson = (
  id: string,
  title: string,
  durationMinutes: number,
  position: number,
) => ({ id, title, durationMinutes, position });

export const modules: CourseModule[] = [
  {
    id: 'm-1',
    title: 'Primeiros passos',
    position: 1,
    lessons: [
      lesson('l-1', 'Por que TypeScript', 6, 1),
      lesson('l-2', 'Instalando e configurando', 11, 2),
      lesson('l-3', 'Tipos básicos', 14, 3),
    ],
  },
  {
    id: 'm-2',
    title: 'Funções e objetos',
    position: 2,
    lessons: [
      lesson('l-4', 'Funções tipadas', 12, 1),
      lesson('l-5', 'Interfaces e tipos', 16, 2),
    ],
  },
];

export const progress: Progress = {
  completedLessons: 3,
  completedLessonIds: ['l-1', 'l-2', 'l-3'],
  lastLessonId: 'l-4',
  positionSeconds: 140,
};

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export const notifications: Notification[] = [
  {
    id: 'n-1',
    kind: 'answer',
    courseId: 'c-3',
    courseTitle: 'TypeScript do zero',
    lessonId: 'l-3',
    lessonTitle: 'Tipos básicos',
    questionId: 'q-1',
    actorName: 'Bruno Costa',
    byInstructor: true,
    read: false,
    createdAt: minutesAgo(4),
  },
  {
    id: 'n-2',
    kind: 'lesson',
    courseId: 'c-1',
    courseTitle: 'React com testes',
    lessonId: 'l-9',
    lessonTitle: 'Testando formulários',
    byInstructor: false,
    read: false,
    createdAt: minutesAgo(90),
  },
  {
    id: 'n-3',
    kind: 'question',
    courseId: 'c-2',
    courseTitle: 'Design de APIs REST na prática',
    lessonId: 'l-1',
    lessonTitle: 'Recursos e verbos',
    questionId: 'q-2',
    actorName: 'Ana Lima',
    byInstructor: false,
    read: true,
    createdAt: minutesAgo(60 * 26),
  },
  {
    id: 'n-4',
    kind: 'archived',
    courseId: 'c-9',
    courseTitle: 'jQuery para iniciantes',
    byInstructor: false,
    read: true,
    createdAt: minutesAgo(60 * 24 * 9),
  },
  {
    id: 'n-5',
    kind: 'export-ready',
    courseId: 'c-2',
    courseTitle: 'Design de APIs REST na prática',
    exportId: 'e-1',
    byInstructor: false,
    read: true,
    createdAt: minutesAgo(60 * 24 * 40),
  },
];

export const reviews: Review[] = [
  {
    studentName: 'Ana Lima',
    rating: 5,
    comment:
      'Direto ao ponto. As aulas de tipos básicos tiraram dúvidas que eu tinha havia anos.',
    createdAt: '2026-11-02T12:00:00.000Z',
    updatedAt: '2026-11-02T12:00:00.000Z',
  },
  {
    studentName: 'Rafael Souza',
    rating: 4,
    comment: '',
    createdAt: '2026-10-20T12:00:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
  },
  {
    studentName: 'Júlia Prado',
    rating: 3,
    comment: 'Bom conteúdo.\nSenti falta de exercícios no fim de cada módulo.',
    createdAt: '2026-10-05T12:00:00.000Z',
    updatedAt: '2026-10-05T12:00:00.000Z',
  },
];

export const myReview: MyReview = {
  courseId: 'c-3',
  rating: 4,
  comment: 'Gostei muito do módulo de funções.',
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
};
