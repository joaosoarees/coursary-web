import { LoaderCircle } from 'lucide-react';
import { useId, useRef } from 'react';

import { AVATAR_HINT, AVATAR_TYPES } from '~/account/avatarRules';
import { initialsOf } from '~/account/initialsOf';
import { useAvatarUpload } from '~/account/useAvatarUpload';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { FormAlert } from '~/components/visitor/FormMessage';
import type { Profile } from '~/services/AccountService';

export function AvatarCard({ profile }: { profile: Profile }) {
  const titleId = useId();
  const hintId = useId();
  const input = useRef<HTMLInputElement>(null);
  const { phase, problem, upload } = useAvatarUpload();
  const busy = phase.step !== 'idle';
  const shown =
    phase.step === 'idle' ? profile.avatarUrl?.['256'] : phase.preview;
  const percent =
    phase.step === 'uploading' ? Math.round(phase.progress * 100) : 100;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col items-start gap-5 rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
    >
      <h2 id={titleId} className="font-display text-xl font-bold">
        Foto
      </h2>
      <div className="relative">
        <Avatar className="size-40">
          {shown && <AvatarImage src={shown} alt="" className="object-cover" />}
          <AvatarFallback className="bg-chalk-yellow text-5xl font-bold text-chalk-yellow-foreground">
            {initialsOf(profile.name)}
          </AvatarFallback>
        </Avatar>
        {busy && (
          <div className="absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white">
            <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
          </div>
        )}
      </div>
      {busy && (
        <div className="flex w-full max-w-60 flex-col gap-1.5">
          <div
            role="progressbar"
            aria-label="Envio da foto"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${String(percent)}%` }}
            />
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {phase.step === 'uploading'
              ? `Enviando… ${String(percent)}%`
              : 'Processando a foto…'}
          </p>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept={AVATAR_TYPES.join(',')}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';

          if (file) {
            void upload(file);
          }
        }}
      />
      <Button
        variant="outline"
        disabled={busy}
        aria-describedby={hintId}
        onClick={() => input.current?.click()}
      >
        {phase.step === 'uploading'
          ? 'Enviando…'
          : phase.step === 'processing'
            ? 'Processando…'
            : 'Trocar foto'}
      </Button>
      <p id={hintId} className="text-sm text-muted-foreground">
        {AVATAR_HINT}
      </p>
      {problem && <FormAlert>{problem}</FormAlert>}
    </section>
  );
}
