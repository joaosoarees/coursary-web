import {
  Archive,
  CircleAlert,
  Clock,
  MessageCircleQuestion,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { LoadingNote } from '~/components/LoadingNote';
import { LoadMore } from '~/components/LoadMore';
import { PostForm } from '~/components/questions/PostForm';
import { QuestionItem } from '~/components/questions/QuestionItem';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { useAskQuestion } from '~/mutations/questions';
import { useQuestions } from '~/queries/questions';
import type { Question } from '~/services/QuestionService';

export type QuestionsViewer = 'student' | 'owner' | 'admin';

const NO_QUESTIONS: Question[] = [];

const INTRO: Record<QuestionsViewer, string> = {
  student:
    'Dúvidas dos alunos sobre esta aula, respondidas pelo instrutor e pelos colegas.',
  owner:
    'As dúvidas dos alunos sobre esta aula. A sua resposta sai marcada como do instrutor.',
  admin:
    'As dúvidas dos alunos sobre esta aula. Você pode apagar perguntas e respostas.',
};

export function QuestionsSection({
  courseId,
  lessonId,
  courseStatus,
  viewer,
}: {
  courseId: string;
  lessonId: string;
  courseStatus: string;
  viewer: QuestionsViewer;
}) {
  const lesson = { courseId, lessonId };
  const draft = courseStatus === 'DRAFT';
  const writable = courseStatus === 'PUBLISHED';
  const questions = useQuestions(lesson, !draft);
  const ask = useAskQuestion(lesson);
  const heading = useRef<HTMLHeadingElement>(null);
  // Fixed while the page is open, so the dates do not shift under the reader.
  const [now] = useState(() => new Date());
  const items =
    questions.data?.pages.flatMap((page) => page.items) ?? NO_QUESTIONS;
  const reply = writable && viewer !== 'admin' ? viewer : null;
  const focusHeading = () => {
    heading.current?.focus();
  };

  return (
    <section
      aria-labelledby={`perguntas-${lessonId}`}
      className="flex flex-col gap-5 border-t pt-7"
    >
      <div className="flex flex-col gap-1">
        <h2
          ref={heading}
          id={`perguntas-${lessonId}`}
          tabIndex={-1}
          className="font-display text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Perguntas
        </h2>
        <p className="max-w-prose text-muted-foreground">
          {draft ? 'Os alunos perguntam aqui, e você responde.' : INTRO[viewer]}
        </p>
      </div>
      {courseStatus === 'ARCHIVED' && (
        <Note icon={Archive}>
          Este curso foi arquivado: as perguntas ficam só para leitura.
        </Note>
      )}
      {draft && (
        <Note icon={Clock}>
          As perguntas abrem quando o curso for publicado.
        </Note>
      )}
      {writable && viewer === 'student' && (
        <PostForm
          className="rounded-md border bg-card p-5 shadow-sm"
          label="Faça uma pergunta sobre esta aula"
          placeholder="Escreva a sua dúvida"
          hint="Texto simples, até 2.000 caracteres."
          emptyMessage="Escreva a pergunta antes de enviar."
          submit={{ label: 'Perguntar', pending: 'Enviando…' }}
          rows={3}
          onPost={(text) => ask.mutateAsync(text)}
        />
      )}
      {!draft && questions.isLoading && (
        <>
          <LoadingNote>Carregando as perguntas…</LoadingNote>
          <div
            aria-hidden="true"
            className="flex flex-col gap-4 rounded-md border bg-card p-5"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full max-w-prose" />
            <Skeleton className="h-4 w-2/3 max-w-prose" />
          </div>
        </>
      )}
      {questions.isLoadingError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-md border border-input bg-card py-4 pr-4 pl-5"
        >
          <span className="flex items-start gap-2.5">
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-destructive"
            />
            <span className="flex flex-col">
              <strong>Não deu para carregar as perguntas.</strong>
              <span className="text-muted-foreground">
                A aula continua aqui; tente de novo em instantes.
              </span>
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void questions.refetch();
            }}
          >
            Tentar de novo
          </Button>
        </div>
      )}
      {questions.isSuccess && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-input px-6 py-12 text-center">
          <MessageCircleQuestion
            aria-hidden="true"
            className="size-8 text-muted-foreground"
          />
          <div className="flex max-w-prose flex-col gap-1">
            <h3 className="font-display text-xl font-bold">
              Nenhuma pergunta nesta aula ainda
            </h3>
            <p className="text-muted-foreground">
              {viewer === 'student'
                ? writable
                  ? 'Ficou com dúvida? Pergunte acima: o instrutor e os colegas respondem aqui.'
                  : 'Ninguém perguntou nada nesta aula.'
                : 'Quando um aluno perguntar, a pergunta aparece aqui.'}
            </p>
          </div>
        </div>
      )}
      {items.length > 0 && (
        <ol className="flex flex-col rounded-md border bg-card shadow-sm">
          {items.map((question) => (
            <QuestionItem
              key={question.id}
              lesson={lesson}
              question={question}
              reply={reply}
              adminNote={viewer === 'admin'}
              now={now}
              onLeave={focusHeading}
            />
          ))}
        </ol>
      )}
      <LoadMore
        list={questions}
        auto={false}
        labels={{
          more: 'Carregar mais perguntas',
          loading: 'Carregando perguntas…',
          failed: 'Não deu para carregar mais perguntas.',
        }}
      />
    </section>
  );
}

function Note({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <p
      role="note"
      className="flex items-start gap-2.5 rounded-md border border-input bg-muted px-4 py-3"
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
