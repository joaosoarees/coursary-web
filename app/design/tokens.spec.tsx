import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { ColorTokens } from './ColorTokens';
import { MotionTokens } from './MotionTokens';
import { ShapeTokens } from './ShapeTokens';
import { TypeTokens } from './TypeTokens';

// jsdom draws nothing, so contrast is app/theme.spec.ts's job.
const violations = async () => {
  const { violations } = await axe.run(document.body, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    rules: { 'color-contrast': { enabled: false } },
  });

  return violations.map(({ id, nodes }) => ({
    id,
    targets: nodes.map(({ target }) => target.join(' ')),
  }));
};

describe('token blocks', () => {
  it('should name every colour token in both themes', () => {
    render(
      <>
        <ColorTokens theme="light" />
        <ColorTokens theme="dark" />
      </>,
    );

    for (const token of ['primary', 'screen', 'chalk-yellow-foreground']) {
      expect(screen.getAllByText(token, { selector: 'code' })).toHaveLength(2);
    }
  });

  it('should say when the stylesheet has no value for a token', () => {
    render(<MotionTokens />);

    expect(screen.getAllByText('não definido')).toHaveLength(4);
  });

  it('should have no accessibility violations', async () => {
    render(
      <>
        <ColorTokens theme="light" />
        <ColorTokens theme="dark" />
        <TypeTokens />
        <ShapeTokens />
        <MotionTokens />
      </>,
    );

    expect(await violations()).toEqual([]);
  });
});
