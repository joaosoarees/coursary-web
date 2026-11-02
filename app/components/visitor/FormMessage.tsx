import { CircleAlert, CircleCheck } from 'lucide-react';

export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-2.5 rounded-md border border-destructive px-3.5 py-3 text-[0.9375rem]"
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4.5 shrink-0 text-destructive"
      />
      <div>{children}</div>
    </div>
  );
}

export function FormNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="flex gap-2.5 rounded-md bg-success-soft px-3.5 py-3 text-[0.9375rem] text-success"
    >
      <CircleCheck aria-hidden="true" className="mt-0.5 size-4.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
