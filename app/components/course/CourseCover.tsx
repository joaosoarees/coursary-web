import { ChalkStroke } from '~/components/ChalkStroke';
import { cn } from '~/lib/utils';

const CHALKS = [
  'text-chalk',
  'text-chalk-yellow',
  'text-chalk-blue',
  'text-chalk-pink',
] as const;

const chalkOf = (courseId: string) => {
  let sum = 0;

  for (const char of courseId) {
    sum += char.charCodeAt(0);
  }

  return CHALKS[sum % CHALKS.length] ?? CHALKS[0];
};

export function CourseCover({
  courseId,
  title,
  coverUrl,
  large = false,
  className,
}: {
  courseId: string;
  title: string;
  coverUrl?: Record<string, string>;
  large?: boolean;
  className?: string;
}) {
  const small = coverUrl?.['480'];
  const big = coverUrl?.['1280'];

  if (small ?? big) {
    return (
      <img
        src={small ?? big}
        srcSet={small && big ? `${small} 480w, ${big} 1280w` : undefined}
        sizes={
          large
            ? '(min-width: 768px) 340px, 100vw'
            : '(min-width: 768px) 320px, 100vw'
        }
        alt=""
        loading="lazy"
        className={cn(
          'aspect-video w-full rounded-md bg-muted object-cover',
          className,
        )}
      />
    );
  }

  // Type and padding follow the plate's width, so the title wraps the same at every card size and
  // does not jump while the sidebar opens or closes.
  return (
    <div
      aria-hidden="true"
      className={cn(
        '@container aspect-video w-full overflow-hidden rounded-md bg-board ring-1 ring-chalk/10 ring-inset',
        chalkOf(courseId),
        className,
      )}
    >
      <div className="flex h-full flex-col justify-end gap-[2.5cqi] p-[6cqi]">
        <span className="line-clamp-3 font-display text-[7cqi] leading-tight font-bold tracking-tight text-balance">
          {title}
        </span>
        <ChalkStroke className="w-[28cqi]" />
      </div>
    </div>
  );
}
