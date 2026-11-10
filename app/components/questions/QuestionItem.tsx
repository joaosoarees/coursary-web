import { ChevronDown, CircleMinus, MessageCircle } from 'lucide-react';
import { useId, useState } from 'react';

import { AnswerThread } from '~/components/questions/AnswerThread';
import { DeletePost } from '~/components/questions/DeletePost';
import { RelativeTime } from '~/components/questions/RelativeTime';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { useDeleteQuestion } from '~/mutations/questions';
import type { LessonRef, Question } from '~/services/QuestionService';

export function QuestionItem({
  lesson,
  question,
  reply,
  adminNote,
  now,
  onLeave,
}: {
  lesson: LessonRef;
  question: Question;
  reply: 'student' | 'owner' | null;
  adminNote: boolean;
  now: Date;
  onLeave: () => void;
}) {
  const threadId = useId();
  const [open, setOpen] = useState(false);
  const deleteQuestion = useDeleteQuestion(lesson);
  const count = question.answerCount;
  // A removed question takes no more answers.
  const canReply = reply !== null && !question.removed;
  const time = (
    <time
      dateTime={question.createdAt}
      title={RelativeTime.full(question.createdAt)}
      className="text-sm text-muted-foreground"
    >
      {RelativeTime.format(question.createdAt, now)}
    </time>
  );

  return (
    <li className="flex flex-col gap-2.5 px-4 py-4 not-first:border-t sm:px-5 sm:py-4.5">
      <article
        aria-label={
          question.removed
            ? 'Pergunta removida'
            : `Pergunta de ${question.authorName}`
        }
        className="flex flex-col gap-1.5"
      >
        {question.removed ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <CircleMinus aria-hidden="true" className="size-4.5 shrink-0" />
            <span>
              <strong>Pergunta removida</strong> pelo autor ou pela moderação ·{' '}
              {time}
            </span>
          </p>
        ) : (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <strong>{question.authorName}</strong>
              {time}
            </p>
            <p className="max-w-prose break-words whitespace-pre-wrap">
              {question.text}
            </p>
          </>
        )}
      </article>
      <div className="-ml-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {count > 0 || canReply ? (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            aria-controls={open ? threadId : undefined}
            className="px-3 text-link"
            onClick={() => {
              setOpen((value) => !value);
            }}
          >
            <MessageCircle aria-hidden="true" />
            {count === 0
              ? 'Responder'
              : count === 1
                ? '1 resposta'
                : `${String(count)} respostas`}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform motion-reduce:transition-none',
                open && 'rotate-180',
              )}
            />
          </Button>
        ) : (
          <span className="px-3 leading-10 text-muted-foreground">
            Sem respostas
          </span>
        )}
        {question.canDelete && !question.removed && (
          <DeletePost
            label={`Apagar a pergunta de ${question.authorName}`}
            title="Apagar a pergunta?"
            description={
              count === 0
                ? 'A pergunta sai da aula e não volta.'
                : `Ela já tem ${count === 1 ? '1 resposta' : `${String(count)} respostas`}: a pergunta sai, sem o nome e o texto, e as respostas continuam visíveis.`
            }
            confirmLabel="Apagar pergunta"
            onDelete={() => deleteQuestion.mutateAsync(question.id)}
            onDeleted={onLeave}
          />
        )}
      </div>
      {open && (
        <AnswerThread
          id={threadId}
          questionRef={{ ...lesson, questionId: question.id }}
          question={question}
          reply={canReply ? reply : null}
          adminNote={adminNote}
          now={now}
          onLeave={onLeave}
        />
      )}
    </li>
  );
}
