import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import {
  QuestionsSection,
  type QuestionsViewer,
} from '~/components/questions/QuestionsSection';
import {
  type Answer,
  type Question,
  QuestionService,
} from '~/services/QuestionService';
import { apiError } from '~/test/renderRoutes';

const asked: Question = {
  id: 'q1',
  authorName: 'Bruno Reis',
  text: 'Qual a diferença entre agg e sum?',
  createdAt: '2026-11-10T10:00:00.000Z',
  answerCount: 1,
  removed: false,
  canDelete: false,
};
const mine: Question = {
  id: 'q2',
  authorName: 'Duda Lima',
  text: 'A data veio como texto.',
  createdAt: '2026-11-09T10:00:00.000Z',
  answerCount: 0,
  removed: false,
  canDelete: true,
};
const removed: Question = {
  id: 'q3',
  authorName: '',
  text: '',
  createdAt: '2026-11-07T10:00:00.000Z',
  answerCount: 1,
  removed: true,
  canDelete: false,
};
const byInstructor: Answer = {
  id: 'a1',
  authorName: 'Ana Souza',
  text: 'Para uma soma só, nenhuma.',
  createdAt: '2026-11-10T11:00:00.000Z',
  byInstructor: true,
  canDelete: false,
};

const page = <T,>(items: T[], nextCursor: string | null = null) => ({
  items,
  nextCursor,
});

let list: MockInstance<typeof QuestionService.list>;
let answers: MockInstance<typeof QuestionService.answers>;

beforeEach(() => {
  vi.restoreAllMocks();
  list = vi
    .spyOn(QuestionService, 'list')
    .mockResolvedValue(page([asked, mine, removed]));
  answers = vi
    .spyOn(QuestionService, 'answers')
    .mockResolvedValue(page([byInstructor]));
});

const renderSection = (
  viewer: QuestionsViewer = 'student',
  courseStatus = 'PUBLISHED',
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <QuestionsSection
        courseId="c1"
        lessonId="l1"
        courseStatus={courseStatus}
        viewer={viewer}
      />
    </QueryClientProvider>,
  );

const question = (name: string) =>
  screen.findByRole('article', { name }).then((article) => {
    const item = article.closest('li');

    if (!item) {
      throw new Error(`No list item for ${name}.`);
    }

    return within(item);
  });

describe('QuestionsSection', () => {
  it('should let a student ask, and reload the list with the new question', async () => {
    const ask = vi.spyOn(QuestionService, 'ask').mockResolvedValue(mine);
    renderSection();

    await question('Pergunta de Bruno Reis');
    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Faça uma pergunta sobre esta aula',
      }),
      { target: { value: 'Preciso do @ no query?' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Perguntar' }));

    await waitFor(() => {
      expect(ask).toHaveBeenCalledWith(
        { courseId: 'c1', lessonId: 'l1' },
        'Preciso do @ no query?',
      );
    });
    await waitFor(() => {
      expect(list).toHaveBeenCalledTimes(2);
    });
  });

  it('should open the answers on demand, with the instructor marked and a reply field', async () => {
    renderSection();

    const bruno = await question('Pergunta de Bruno Reis');
    const toggle = bruno.getByRole('button', { name: /1 resposta/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(answers).not.toHaveBeenCalled();

    fireEvent.click(toggle);

    const thread = within(
      await bruno.findByRole('list', {
        name: 'Respostas à pergunta de Bruno Reis',
      }),
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(thread.getByText('Para uma soma só, nenhuma.')).toBeInTheDocument();
    expect(thread.getByText('Instrutor')).toBeInTheDocument();
    expect(
      bruno.getByRole('textbox', { name: 'Sua resposta' }),
    ).toHaveAttribute('placeholder', 'Escreva a sua resposta');
  });

  it('should show a removed question without author, text or a reply field', async () => {
    renderSection();

    const gone = await question('Pergunta removida');
    expect(gone.getByText('Pergunta removida')).toBeInTheDocument();
    fireEvent.click(gone.getByRole('button', { name: /1 resposta/ }));

    expect(
      await gone.findByText('Para uma soma só, nenhuma.'),
    ).toBeInTheDocument();
    expect(gone.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      gone.queryByRole('button', { name: /Apagar a pergunta/ }),
    ).toBeNull();
  });

  it('should offer Apagar only where the API allows it, and confirm before deleting', async () => {
    const remove = vi.spyOn(QuestionService, 'remove').mockResolvedValue();
    renderSection();

    const bruno = await question('Pergunta de Bruno Reis');
    expect(bruno.queryByRole('button', { name: /Apagar/ })).toBeNull();

    const duda = await question('Pergunta de Duda Lima');
    fireEvent.click(
      duda.getByRole('button', { name: 'Apagar a pergunta de Duda Lima' }),
    );
    const dialog = within(await screen.findByRole('alertdialog'));
    expect(
      dialog.getByText('A pergunta sai da aula e não volta.'),
    ).toBeInTheDocument();
    fireEvent.click(dialog.getByRole('button', { name: 'Apagar pergunta' }));

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith({
        courseId: 'c1',
        lessonId: 'l1',
        questionId: 'q2',
      });
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Perguntas' })).toHaveFocus();
    });
  });

  it('should keep an archived course read-only, with deleting still allowed', async () => {
    renderSection('student', 'ARCHIVED');

    expect(
      await screen.findByText(
        'Este curso foi arquivado: as perguntas ficam só para leitura.',
      ),
    ).toBeInTheDocument();
    const duda = await question('Pergunta de Duda Lima');
    expect(screen.queryByRole('button', { name: 'Perguntar' })).toBeNull();
    expect(duda.getByText('Sem respostas')).toBeInTheDocument();
    expect(
      duda.getByRole('button', { name: 'Apagar a pergunta de Duda Lima' }),
    ).toBeInTheDocument();

    const bruno = await question('Pergunta de Bruno Reis');
    fireEvent.click(bruno.getByRole('button', { name: /1 resposta/ }));
    expect(
      await bruno.findByText('Para uma soma só, nenhuma.'),
    ).toBeInTheDocument();
    expect(bruno.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should let the owner answer as the instructor, without asking', async () => {
    renderSection('owner');

    const duda = await question('Pergunta de Duda Lima');
    expect(screen.queryByRole('button', { name: 'Perguntar' })).toBeNull();
    fireEvent.click(duda.getByRole('button', { name: /Responder/ }));

    expect(
      await duda.findByRole('textbox', { name: 'Sua resposta' }),
    ).toHaveAttribute(
      'placeholder',
      'A sua resposta sai marcada como do instrutor',
    );
  });

  it('should let an admin read without a reply field', async () => {
    renderSection('admin');

    const bruno = await question('Pergunta de Bruno Reis');
    fireEvent.click(bruno.getByRole('button', { name: /1 resposta/ }));

    expect(
      await bruno.findByText(
        'Respondem o instrutor do curso e os alunos matriculados.',
      ),
    ).toBeInTheDocument();
    expect(bruno.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      (await question('Pergunta de Duda Lima')).getByText('Sem respostas'),
    ).toBeInTheDocument();
  });

  it('should not ask for the questions of a draft', () => {
    renderSection('owner', 'DRAFT');

    expect(
      screen.getByText('As perguntas abrem quando o curso for publicado.'),
    ).toBeInTheDocument();
    expect(list).not.toHaveBeenCalled();
  });

  it('should invite the first question when there is none', async () => {
    list.mockResolvedValue(page([]));
    renderSection();

    expect(
      await screen.findByRole('heading', {
        name: 'Nenhuma pergunta nesta aula ainda',
      }),
    ).toBeInTheDocument();
  });

  it('should offer to try again when the list does not load', async () => {
    list
      .mockRejectedValueOnce(apiError(500, 'INTERNAL'))
      .mockResolvedValue(page([asked]));
    renderSection();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não deu para carregar as perguntas.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await question('Pergunta de Bruno Reis')).toBeTruthy();
  });

  it('should load the next page on demand', async () => {
    list
      .mockResolvedValueOnce(page([asked], 'next'))
      .mockResolvedValueOnce(page([mine]));
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Carregar mais perguntas' }),
    );

    expect(await question('Pergunta de Duda Lima')).toBeTruthy();
    expect(list).toHaveBeenLastCalledWith(
      { courseId: 'c1', lessonId: 'l1' },
      { cursor: 'next', limit: 10 },
      expect.anything(),
    );
  });

  it('should hand the focus back to the toggle after deleting an answer', async () => {
    answers.mockResolvedValue(page([{ ...byInstructor, canDelete: true }]));
    vi.spyOn(QuestionService, 'removeAnswer').mockImplementation(() => {
      answers.mockResolvedValue(page([]));
      return Promise.resolve();
    });
    renderSection('owner');

    const bruno = await question('Pergunta de Bruno Reis');
    const toggle = bruno.getByRole('button', { name: /1 resposta/ });
    fireEvent.click(toggle);
    fireEvent.click(
      await bruno.findByRole('button', {
        name: 'Apagar a resposta de Ana Souza',
      }),
    );
    fireEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Apagar resposta',
      }),
    );

    await waitFor(() => {
      expect(toggle).toHaveFocus();
    });
  });
});
