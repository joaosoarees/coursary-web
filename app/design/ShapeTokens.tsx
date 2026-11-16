import { CssValue } from '~/design/CssValue';
import { cn } from '~/lib/utils';

const RADII = [
  {
    name: 'rounded-sm',
    use: 'itens dentro de um menu',
    className: 'rounded-sm',
  },
  {
    name: 'rounded-md',
    use: 'botões, campos, cards, diálogos, menus',
    className: 'rounded-md',
  },
  { name: 'rounded-full', use: 'selos e avatares', className: 'rounded-full' },
];

const SHADOWS = [
  { name: 'shadow-sm', use: 'Assentado: o card', className: 'shadow-sm' },
  {
    name: 'shadow-md',
    use: 'Erguido: menus, popovers, diálogos',
    className: 'shadow-md',
  },
];

const parentStyle = (element: HTMLElement) =>
  getComputedStyle(element.parentElement ?? element);

// A pill's radius computes to a huge number of pixels.
const radiusOf = (element: HTMLElement) => {
  const radius = parentStyle(element).borderTopLeftRadius;

  return Number.parseFloat(radius) > 1000 ? 'pílula' : radius;
};

// Tailwind composes every shadow with its empty ring and inset layers; only the real ones count.
const shadowOf = (element: HTMLElement) =>
  parentStyle(element)
    .boxShadow.split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .filter((layer) => !layer.startsWith('rgba(0, 0, 0, 0)'))
    .join(', ');

function Sample({
  name,
  use,
  className,
  read,
}: {
  name: string;
  use: string;
  className: string;
  read: (element: HTMLElement) => string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <div
        className={cn(
          'flex h-20 items-end border bg-card p-2 text-card-foreground',
          className,
        )}
      >
        <CssValue read={read} className="text-muted-foreground" />
      </div>
      <code className="text-sm font-bold">{name}</code>
      <span className="text-sm text-muted-foreground">{use}</span>
    </li>
  );
}

export function ShapeTokens() {
  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-background p-5 text-foreground">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-5">
        {RADII.map((radius) => (
          <Sample key={radius.name} {...radius} read={radiusOf} />
        ))}
      </ul>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5">
        {SHADOWS.map((shadow) => (
          <Sample
            key={shadow.name}
            {...shadow}
            className={cn('rounded-md', shadow.className)}
            read={shadowOf}
          />
        ))}
      </ul>
    </div>
  );
}
