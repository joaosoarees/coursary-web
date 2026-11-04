import Markdown, { type Components } from 'react-markdown';

const LINK =
  'rounded-sm text-link underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

// Only a link to another site leaves the lesson for a new tab; an anchor or a page of the app stays.
const isExternal = (href: string | undefined) => {
  if (href === undefined || !/^https?:\/\//.test(href)) {
    return false;
  }

  return URL.canParse(href) && new URL(href).origin !== window.location.origin;
};

// The page already has its h1 (the lesson title), so the body's headings start one level down.
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-2.5 font-display text-xl font-bold">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="mt-2.5 text-lg font-bold">{children}</h3>
  ),
  h3: ({ children }) => <h4 className="mt-2 font-bold">{children}</h4>,
  h4: ({ children }) => <h5 className="mt-2 font-bold">{children}</h5>,
  h5: ({ children }) => <h6 className="mt-2 font-bold">{children}</h6>,
  h6: ({ children }) => <h6 className="mt-2 font-bold">{children}</h6>,
  p: ({ children }) => <p className="max-w-prose">{children}</p>,
  ul: ({ children }) => (
    <ul className="flex max-w-prose list-disc flex-col gap-1.5 pl-5.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="flex max-w-prose list-decimal flex-col gap-1.5 pl-5.5">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="max-w-prose border-l border-input pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) =>
    isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
        {children}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    ) : (
      <a href={href} className={LINK}>
        {children}
      </a>
    ),
  pre: ({ children }) => (
    <pre className="max-w-prose overflow-x-auto rounded-md bg-muted p-4 text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded-sm bg-muted px-1.25 py-px font-mono text-[0.9em]">
      {children}
    </code>
  ),
};

export function LessonBody({ markdown }: { markdown: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
