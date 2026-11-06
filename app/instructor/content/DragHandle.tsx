import { GripVertical } from 'lucide-react';
import type { DragControls } from 'motion/react';

// The pointer's way to reorder; the keyboard uses the arrows beside it, so the handle is not a stop.
export function DragHandle({
  controls,
  label,
}: {
  controls: DragControls;
  label: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={label}
      onPointerDown={(event) => {
        controls.start(event);
      }}
      className="grid h-10 w-7 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </span>
  );
}
