import { GraduationCap } from 'lucide-react';

import { LoadMore } from '~/components/LoadMore';
import { DeletePost } from '~/components/questions/DeletePost';
import { PostForm } from '~/components/questions/PostForm';
import { RelativeTime } from '~/components/questions/RelativeTime';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import { useAnswerQuestion, useDeleteAnswer } from '~/mutations/questions';
import { useAnswers } from '~/queries/questions';
import type { Answer, Question, QuestionRef } from '~/services/QuestionService';

const NO_ANSWERS: Answer[] = [];

export function AnswerThread({
  id,
  questionRef,
  question,
  reply,
  adminNote,
  now,
  onLeave,
}: {
  id: string;
  questionRef: QuestionRef;
  question: Question;
  reply: 'student' | 'owner' | null;
  adminNote: boolean;
  now: Date;
  onLeave: () => void;
}) {
  const answers = useAnswers(questionRef);
  const answer = useAnswerQuestion(questionRef);
  const deleteAnswer = useDeleteAnswer(questionRef);
  const items = answers.data?.pages.flatMap((page) => page.items) ?? NO_ANSWERS;
  const author = question.removed ? 'autor removido' : question.authorName;
  // The last answer of a removed question takes the question with it.
  const lastOfRemoved = question.removed && question.answerCount === 1;

  return (
    <div
      id={id}
      className="flex flex-col gap-1 rounded-md bg-background px-4 pt-1 pb-4"
    >
      {answers.isLoading && (
        <div aria-hidden="true" className="flex flex-col gap-2 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full max-w-prose" />
        </div>
      )}
      {answers.isLoadingError && (
        <div className="flex flex-wrap items-center gap-3 py-3">
          <p role="alert" className="text-destructive">
            Não deu para carregar as respostas.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void answers.refetch();
            }}
          >
            Tentar de novo
          </Button>
        </div>
      )}
      {items.length > 0 && (
        <ol aria-label={`Respostas à pergunta de ${author}`}>
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'flex flex-col gap-1 pt-3 pb-1.5',
                index > 0 && 'border-t',
              )}
            >
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <strong>{item.authorName}</strong>
                {item.byInstructor && (
                  <Badge variant="outline" className="border-input">
                    <GraduationCap aria-hidden="true" />
                    Instrutor
                  </Badge>
                )}
                <time
                  dateTime={item.createdAt}
                  title={RelativeTime.full(item.createdAt)}
                  className="text-sm text-muted-foreground"
                >
                  {RelativeTime.format(item.createdAt, now)}
                </time>
              </p>
              <p className="max-w-prose break-words whitespace-pre-wrap">
                {item.text}
              </p>
              {item.canDelete && (
                <div className="-ml-3">
                  <DeletePost
                    label={`Apagar a resposta de ${item.authorName}`}
                    title="Apagar a resposta?"
                    description={
                      lastOfRemoved
                        ? 'É a última resposta de uma pergunta removida: a pergunta sai junto.'
                        : 'A resposta sai da conversa e não volta.'
                    }
                    confirmLabel="Apagar resposta"
                    onDelete={() => deleteAnswer.mutateAsync(item.id)}
                    onDeleted={onLeave}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
      <LoadMore
        list={answers}
        auto={false}
        className="items-start"
        labels={{
          more: 'Ver mais respostas',
          loading: 'Carregando respostas…',
          failed: 'Não deu para carregar mais respostas.',
        }}
      />
      {reply && (
        <PostForm
          className={cn('pt-3', items.length > 0 && 'border-t')}
          label="Sua resposta"
          placeholder={
            reply === 'owner'
              ? 'A sua resposta sai marcada como do instrutor'
              : 'Escreva a sua resposta'
          }
          emptyMessage="Escreva a resposta antes de enviar."
          submit={{ label: 'Responder', pending: 'Enviando…', size: 'sm' }}
          rows={2}
          onPost={(text) => answer.mutateAsync(text)}
        />
      )}
      {adminNote && (
        <p
          className={cn(
            'pt-3 text-sm text-muted-foreground',
            items.length > 0 && 'border-t',
          )}
        >
          Respondem o instrutor do curso e os alunos matriculados.
        </p>
      )}
    </div>
  );
}
