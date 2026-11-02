const formatWait = (seconds: number) =>
  `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, '0')}`;

export function ResendCodeButton({
  remaining,
  pending,
  onResend,
}: {
  remaining: number;
  pending: boolean;
  onResend: () => void;
}) {
  if (remaining > 0) {
    return (
      <span className="inline-flex min-h-10 items-center text-[0.9375rem] text-muted-foreground tabular-nums">
        Reenviar em {formatWait(remaining)}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onResend}
      className="inline-flex min-h-10 items-center rounded-md px-1 font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Reenviando…' : 'Reenviar código'}
    </button>
  );
}
