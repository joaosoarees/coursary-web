import { Star } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { FormAlert } from '~/components/visitor/FormMessage';
import { cn } from '~/lib/utils';
import { useSaveReview } from '~/mutations/review';
import { ApiFailure } from '~/services/ApiFailure';
import type { MyReview } from '~/services/ReviewService';

const MAX_COMMENT = 2000;
const STARS = [1, 2, 3, 4, 5];

export function ReviewDialog({
  courseId,
  courseTitle,
  review,
  finished = false,
  open,
  onOpenChange,
}: {
  courseId: string;
  courseTitle: string;
  review: MyReview | null;
  finished?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[32rem]">
        {/* Mounted with the dialog, so every opening starts from the saved review. */}
        {open && (
          <ReviewForm
            courseId={courseId}
            courseTitle={courseTitle}
            review={review}
            finished={finished}
            onDone={() => {
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({
  courseId,
  courseTitle,
  review,
  finished,
  onDone,
}: {
  courseId: string;
  courseTitle: string;
  review: MyReview | null;
  finished: boolean;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? '');
  const save = useSaveReview(courseId);
  const commentId = useId();
  const title = finished
    ? 'Você concluiu o curso'
    : review
      ? 'Editar sua avaliação'
      : 'Avaliar o curso';

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(
          { rating, comment: comment.trim() },
          {
            onSuccess: () => {
              toast.success('Avaliação salva.');
              onDone();
            },
          },
        );
      }}
    >
      <DialogHeader className="gap-2">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="text-base">
          {finished ? 'Quer avaliar ' : 'Sua nota para '}
          <strong className="text-foreground">{courseTitle}</strong>
          {finished ? '? ' : '. '}A nota e o comentário aparecem na página do
          curso com o seu nome.
        </DialogDescription>
      </DialogHeader>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">Nota</legend>
        <div className="flex items-center gap-0.5">
          {STARS.map((value) => (
            <label
              key={value}
              className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => {
                  setRating(value);
                }}
                aria-label={
                  value === 1 ? '1 estrela' : `${String(value)} estrelas`
                }
                className="sr-only"
              />
              <Star
                aria-hidden="true"
                className={cn(
                  'size-7',
                  value <= rating
                    ? 'fill-current text-star'
                    : 'text-muted-foreground',
                )}
              />
            </label>
          ))}
          <span className="ml-2.5 text-muted-foreground" aria-hidden="true">
            {rating > 0 ? `${String(rating)} de 5` : 'Escolha de 1 a 5'}
          </span>
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor={commentId} className="font-bold">
          Comentário{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id={commentId}
          rows={4}
          maxLength={MAX_COMMENT}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
          }}
        />
        <span className="self-end text-sm text-muted-foreground">
          {comment.length} de {MAX_COMMENT}
        </span>
      </div>
      {save.error && <FormAlert>{ApiFailure.message(save.error)}</FormAlert>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {finished ? 'Agora não' : 'Cancelar'}
        </Button>
        <Button type="submit" disabled={rating === 0 || save.isPending}>
          {save.isPending
            ? 'Enviando…'
            : review
              ? 'Salvar avaliação'
              : 'Enviar avaliação'}
        </Button>
      </DialogFooter>
    </form>
  );
}
