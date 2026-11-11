import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LessonPreviewRoute from '~/routes/previa-aula';
import { AccountService } from '~/services/AccountService';
import { EnrollmentService } from '~/services/EnrollmentService';
import { InstructorService } from '~/services/InstructorService';
import {
  type CourseOutline,
  type LessonContent,
  LessonService,
} from '~/services/LessonService';
import { QuestionService } from '~/services/QuestionService';
import { RealtimeService } from '~/services/RealtimeService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const outline: CourseOutline = {
  courseId: 'c1',
  title: 'Python para análise de dados',
  status: 'DRAFT',
  modules: [
    {
      id: 'm1',
      title: 'Pandas na prática',
      position: 0,
      lessons: [
        { id: 'l1', title: 'Filtrando', durationMinutes: 16, position: 0 },
        { id: 'l2', title: 'Juntando', durationMinutes: 13, position: 1 },
      ],
    },
  ],
};

const content: LessonContent = {
  lessonId: 'l1',
  courseId: 'c1',
  body: '## O que você vai usar',
  attachments: [],
};

let progress: ReturnType<typeof vi.spyOn>;
let savePosition: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.spyOn(RealtimeService, 'ticket').mockReturnValue(
    new Promise<string>(() => undefined),
  );
  vi.spyOn(LessonService, 'outline').mockResolvedValue(outline);
  vi.spyOn(LessonService, 'open').mockResolvedValue(content);
  progress = vi.spyOn(EnrollmentService, 'progress');
  savePosition = vi.spyOn(EnrollmentService, 'savePosition');
  vi.spyOn(InstructorService, 'get').mockResolvedValue({
    id: 'c1',
    instructorId: 'owner',
    title: outline.title,
    description: '',
    status: 'DRAFT',
    lessonCount: 2,
    enrollmentCount: 0,
    publishedAt: null,
    createdAt: '2026-11-01T12:00:00.000Z',
  });
  vi.spyOn(AccountService, 'getMe').mockResolvedValue({
    id: 'owner',
    name: 'Ana Souza',
    email: 'ana@example.com',
    role: 'instructor',
  });
  vi.spyOn(QuestionService, 'list').mockResolvedValue({
    items: [],
    nextCursor: null,
  });
});

const renderPreview = (lessonId = 'l1') =>
  renderRoutes(
    [
      {
        path: '/instrutor/cursos/:id/aulas/:aulaId/previa',
        Component: LessonPreviewRoute,
      },
    ],
    `/instrutor/cursos/c1/aulas/${lessonId}/previa`,
  );

describe('the lesson preview', () => {
  it('should show the lesson as a student would, with nothing to mark or review', async () => {
    renderPreview();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Filtrando' }),
    ).toBeVisible();
    expect(
      screen.getByText(/é assim que o aluno vê esta aula/).closest('p'),
    ).toHaveTextContent(
      'Prévia: é assim que o aluno vê esta aula. O progresso não fica salvo; o que você fizer nas perguntas, fica.',
    );
    expect(screen.queryByText('Marcar concluída')).toBeNull();
    expect(screen.queryByRole('button', { name: /Avaliar/ })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Próxima aula: Juntando' }),
    ).toHaveAttribute('href', '/instrutor/cursos/c1/aulas/l2/previa');
    expect(progress).not.toHaveBeenCalled();
    expect(savePosition).not.toHaveBeenCalled();
  });

  it('should move to the next lesson inside the preview', async () => {
    vi.spyOn(LessonService, 'open').mockResolvedValue({
      ...content,
      lessonId: 'l2',
    });
    renderPreview();

    fireEvent.click(
      await screen.findByRole('link', { name: 'Próxima aula: Juntando' }),
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Juntando' }),
    ).toBeVisible();
  });

  it('should say when a lesson has no video and no text yet', async () => {
    vi.spyOn(LessonService, 'open').mockResolvedValue({ ...content, body: '' });
    renderPreview();

    expect(
      await screen.findByText('Esta aula ainda não tem vídeo nem texto.'),
    ).toBeVisible();
  });

  it('should say a lesson that is not in one of your courses is not found', async () => {
    vi.spyOn(LessonService, 'open').mockRejectedValue(
      apiError(403, 'FORBIDDEN'),
    );
    renderPreview();

    expect(
      await screen.findByRole('heading', { name: 'Aula não encontrada' }),
    ).toBeVisible();
  });

  it('should keep the questions of a draft closed', async () => {
    renderPreview();

    expect(
      await screen.findByText(
        'As perguntas abrem quando o curso for publicado.',
      ),
    ).toBeVisible();
  });

  it('should let the owner of a published course answer as the instructor', async () => {
    vi.spyOn(LessonService, 'outline').mockResolvedValue({
      ...outline,
      status: 'PUBLISHED',
    });
    renderPreview();

    expect(
      await screen.findByText(
        'As dúvidas dos alunos sobre esta aula. A sua resposta sai marcada como do instrutor.',
      ),
    ).toBeVisible();
  });

  it('should let an admin who does not own the course only read and delete', async () => {
    vi.spyOn(LessonService, 'outline').mockResolvedValue({
      ...outline,
      status: 'PUBLISHED',
    });
    vi.spyOn(AccountService, 'getMe').mockResolvedValue({
      id: 'admin',
      name: 'Rui',
      email: 'rui@example.com',
      role: 'admin',
    });
    renderPreview();

    expect(
      await screen.findByText(
        'As dúvidas dos alunos sobre esta aula. Você pode apagar perguntas e respostas.',
      ),
    ).toBeVisible();
  });
});
