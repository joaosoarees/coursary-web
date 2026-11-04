import { Star } from 'lucide-react';
import { useState } from 'react';

import { ReviewDialog } from '~/components/course/ReviewDialog';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { useMyReview } from '~/queries/course';

export function ReviewButton({
  courseId,
  courseTitle,
  className,
}: {
  courseId: string;
  courseTitle: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const review = useMyReview(courseId);

  // Until the answer says whether there is a review, the button could name the wrong action.
  if (review.isPending || review.isError) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn('w-full', className)}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Star aria-hidden="true" className="text-star" />
        {review.data ? 'Editar sua avaliação' : 'Avaliar o curso'}
      </Button>
      <ReviewDialog
        courseId={courseId}
        courseTitle={courseTitle}
        review={review.data}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
