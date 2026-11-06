export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingLevel = 'h2',
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-input px-6 py-12 text-center">
      <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
      <div className="flex max-w-prose flex-col gap-1">
        <Heading className="font-display text-xl font-bold">{title}</Heading>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
