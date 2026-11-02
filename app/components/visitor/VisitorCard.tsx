import { ChevronLeft } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router';

import { StepMarker } from '~/components/visitor/StepMarker';

export function VisitorCard({
  title,
  description,
  step,
  back,
  footer,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  step?: { current: number; total: number };
  back?: { to: string; label: string };
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const titleId = useId();

  return (
    <div className="flex flex-col gap-5">
      {back && (
        <Link
          to={back.to}
          className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-md font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronLeft aria-hidden="true" className="size-4.5" />
          {back.label}
        </Link>
      )}
      <section
        aria-labelledby={titleId}
        className="flex flex-col gap-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm md:p-8"
      >
        <div className="flex flex-col gap-2">
          <h1
            id={titleId}
            className="font-display text-3xl font-bold tracking-tight text-balance"
          >
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {step && <StepMarker current={step.current} total={step.total} />}
        {children}
      </section>
      {footer && <p className="text-center text-muted-foreground">{footer}</p>}
    </div>
  );
}
