import { Star } from 'lucide-react';

import { CourseFormat } from '~/components/course/CourseFormat';
import { ErrorState } from '~/components/ErrorState';
import { LoadingNote } from '~/components/LoadingNote';
import { LoadMore } from '~/components/LoadMore';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import { useReviews } from '~/queries/course';
import type { Review } from '~/services/CourseService';

const NO_REVIEWS: Review[] = [];
const STARS = [1, 2, 3, 4, 5];

export function ReviewList({ courseId }: { courseId: string }) {
  const list = useReviews(courseId);
  const { data, isLoading, isLoadingError, refetch } = list;
  const reviews = data?.pages.flatMap((page) => page.items) ?? NO_REVIEWS;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        <LoadingNote>Carregando avaliações…</LoadingNote>
        <Skeleton aria-hidden="true" className="h-5 w-1/3" />
        <Skeleton aria-hidden="true" className="h-4 w-4/5" />
      </div>
    );
  }

  if (isLoadingError) {
    return (
      <ErrorState
        variant="block"
        title="Não deu para carregar as avaliações"
        onRetry={() => void refetch()}
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground">Ninguém avaliou este curso ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul>
        {reviews.map((review, index) => (
          <li
            key={`${String(index)}-${review.createdAt}`}
            className="flex flex-col gap-1.5 border-t py-4"
          >
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
              <strong>{review.studentName}</strong>
              <span
                role="img"
                aria-label={`${String(review.rating)} de 5`}
                className="inline-flex gap-0.5 text-star"
              >
                {STARS.map((star) => (
                  <Star
                    key={star}
                    aria-hidden="true"
                    className={cn(
                      'size-4',
                      star <= review.rating && 'fill-current',
                    )}
                  />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                {CourseFormat.date(review.createdAt)}
              </span>
            </div>
            {review.comment && (
              <p className="max-w-prose whitespace-pre-line">
                {review.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
      <LoadMore
        list={list}
        labels={{
          more: 'Carregar mais avaliações',
          loading: 'Carregando mais avaliações…',
          failed: 'Não deu para carregar mais avaliações.',
        }}
        auto={false}
        className="items-start pt-2"
      />
    </div>
  );
}
