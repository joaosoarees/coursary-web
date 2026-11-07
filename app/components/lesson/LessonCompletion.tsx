import { Check, CircleCheck } from 'lucide-react';
import { useId, useState } from 'react';

import { cn } from '~/lib/utils';

// A completion cannot be undone: once done, the box gives way to a status that takes no action.
export function LessonCompletion({
  done,
  pending,
  onComplete,
}: {
  done: boolean;
  pending: boolean;
  onComplete: () => void;
}) {
  const id = useId();
  // The check draws itself only when the student completes the lesson here, not on every visit.
  const [wasDone, setWasDone] = useState(done);
  const [justDone, setJustDone] = useState(false);

  if (done !== wasDone) {
    setWasDone(done);
    setJustDone(done);
  }

  // One live region holds both states, so the change is announced; it existed before the change.
  return (
    <div role="status" className="flex">
      {done ? (
        <span className="inline-flex min-h-11 items-center gap-2.5 px-1.5 font-bold text-success">
          {justDone ? (
            <DrawnCheck />
          ) : (
            <CircleCheck aria-hidden="true" className="size-5" />
          )}
          Concluída
        </span>
      ) : (
        <Box id={id} pending={pending} onComplete={onComplete} />
      )}
    </div>
  );
}

function Box({
  id,
  pending,
  onComplete,
}: {
  id: string;
  pending: boolean;
  onComplete: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-1.5 pr-2.5 font-bold hover:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
        pending && 'cursor-progress',
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={pending}
        aria-busy={pending}
        onChange={() => {
          if (!pending) {
            onComplete();
          }
        }}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="grid size-5 place-items-center rounded-sm border-2 border-muted-foreground"
      >
        {pending && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      {pending ? 'Salvando…' : 'Marcar concluída'}
    </label>
  );
}

// Lucide's circle-check, with the tick drawn after the circle appears.
function DrawnCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <circle cx="12" cy="12" r="10" className="animate-content-in" />
      <path
        d="m9 12 2 2 4-4"
        pathLength={1}
        strokeDasharray="1"
        className="animate-check-draw motion-reduce:animate-none"
      />
    </svg>
  );
}
