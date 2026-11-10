import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '~/components/ConfirmDialog';
import { QuestionFailure } from '~/components/questions/QuestionFailure';
import { Button } from '~/components/ui/button';

export function DeletePost({
  label,
  title,
  description,
  confirmLabel,
  onDelete,
  onDeleted,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onDelete: () => Promise<unknown>;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  // The reload can take the post, and this dialog with it, off the page before the request
  // answers: the focus is moved here instead of waiting for the dialog to close.
  const leave = () => {
    setDeleted(true);
    setOpen(false);
    onDeleted();
  };

  const confirm = async () => {
    setPending(true);
    setError(null);

    try {
      await onDelete();
      leave();
    } catch (failure) {
      if (QuestionFailure.isStale(failure)) {
        toast.error(QuestionFailure.message(failure));
        leave();
        return;
      }

      setError(QuestionFailure.message(failure));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={label}
        className="px-3 text-muted-foreground hover:text-destructive"
        onClick={() => {
          setOpen(true);
        }}
      >
        <Trash2 aria-hidden="true" />
        Apagar
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onCloseAutoFocus={(event) => {
          if (deleted) {
            event.preventDefault();
          }
        }}
        pending={pending}
        error={error}
        onReset={() => {
          setError(null);
        }}
        title={title}
        description={description}
        confirm={{
          label: confirmLabel,
          pending: 'Apagando…',
          destructive: true,
        }}
        onConfirm={() => {
          void confirm();
        }}
      />
    </>
  );
}
