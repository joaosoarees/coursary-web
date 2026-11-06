import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

// A navigation carrying this state goes through: what it leaves behind no longer exists.
export const DISCARDING = { discarding: true };

const discards = (state: unknown) =>
  typeof state === 'object' && state !== null && 'discarding' in state;

// Holds back a navigation inside the app while there are unsaved changes (`when`) or a video
// going up.
export function LeaveConfirmation({
  when,
  uploading = false,
}: {
  when: boolean;
  uploading?: boolean;
}) {
  const holds = when || uploading;
  // The link that started the navigation keeps the focus when the person stays.
  const origin = useRef<HTMLElement | null>(null);
  const blocker = useBlocker(({ nextLocation }) => {
    const blocks = holds && !discards(nextLocation.state);

    // Taken here, before the dialog moves the focus into itself.
    if (blocks && document.activeElement instanceof HTMLElement) {
      origin.current = document.activeElement;
    }

    return blocks;
  });
  const blocked = blocker.state === 'blocked';

  // Saved or sent while a navigation was held back: nothing is left to lose, let it through.
  useEffect(() => {
    if (blocker.state === 'blocked' && !holds) {
      blocker.proceed();
    }
  }, [blocker, holds]);

  return (
    <Dialog
      open={blocked && holds}
      onOpenChange={(open) => {
        if (!open && blocker.state === 'blocked') {
          blocker.reset();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[32rem]"
        onCloseAutoFocus={(event) => {
          if (origin.current?.isConnected) {
            event.preventDefault();
            origin.current.focus();
          }
        }}
      >
        <DialogHeader className="gap-4 text-left">
          <DialogTitle>
            {uploading ? 'Sair e cancelar o envio?' : 'Sair sem salvar?'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {uploading
              ? 'O vídeo ainda está sendo enviado. Sair cancela o envio e descarta o que já chegou.'
              : 'As alterações que você fez nesta página ainda não foram salvas e serão perdidas.'}
            {uploading && when && ' As alterações não salvas também se perdem.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              blocker.reset?.();
            }}
          >
            {uploading ? 'Continuar aqui' : 'Continuar editando'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              blocker.proceed?.();
            }}
          >
            {uploading ? 'Sair e cancelar' : 'Sair sem salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
