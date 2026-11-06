import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { FormAlert } from '~/components/visitor/FormMessage';

// Confirms an action that cannot be undone; a refusal shows inside, and the dialog stays open while
// the request runs.
export function ConfirmDialog({
  open,
  onClose,
  onCloseAutoFocus,
  consequence,
  pending,
  error,
  onReset,
  title,
  description,
  confirm,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus?: (event: Event) => void;
  consequence?: string;
  pending: boolean;
  error: string | null;
  onReset: () => void;
  title: string;
  description: React.ReactNode;
  confirm: { label: string; pending: string; destructive?: boolean };
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) {
          return;
        }

        if (!next) {
          onClose();
          onReset();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[32rem]"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader className="gap-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-4 text-base">
              <p>{description}</p>
              {consequence && <p>{consequence}</p>}
            </div>
          </DialogDescription>
        </DialogHeader>
        {error && <FormAlert>{error}</FormAlert>}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              onClose();
              onReset();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant={confirm.destructive ? 'destructive' : 'default'}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? confirm.pending : confirm.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
