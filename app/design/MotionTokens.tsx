import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { ChalkStroke } from '~/components/ChalkStroke';
import { Button } from '~/components/ui/button';
import { CssValue, cssVariable } from '~/design/CssValue';

const TOKENS = [
  '--ease-chalk',
  '--animate-chalk-draw',
  '--animate-check-draw',
  '--animate-content-in',
];

export function MotionTokens() {
  const [round, setRound] = useState(0);

  return (
    <div className="flex flex-col gap-5 rounded-lg border bg-background p-5 text-foreground">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-60">
          <ChalkStroke key={round} draw className="text-foreground" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRound((count) => count + 1);
          }}
        >
          <RotateCcw aria-hidden="true" />
          Desenhar de novo
        </Button>
      </div>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
        {TOKENS.map((token) => (
          <div key={token} className="contents">
            <dt>
              <code className="text-sm font-bold">{token}</code>
            </dt>
            <dd>
              <CssValue read={cssVariable(token)} className="text-sm" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
