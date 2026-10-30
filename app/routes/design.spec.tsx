import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';

import Design from './design';

const renderDesign = () => {
  const Stub = createRoutesStub([{ path: '/', Component: Design }]);

  render(<Stub />);
};

// WCAG A and AA only: the best-practice `region` rule flags every menu Radix portals to the end
// of <body>. jsdom draws nothing, so contrast is app/theme.spec.ts's job.
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

describe('Design', () => {
  it('should show every section', async () => {
    renderDesign();

    for (const title of [
      'Cores',
      'Tipografia',
      'Botões',
      'Campos',
      'Abas, menu e diálogo',
      'Selos, cartões e tabelas',
      'Estados e avisos',
    ]) {
      expect(
        await screen.findByRole('heading', { level: 2, name: title }),
      ).toBeInTheDocument();
    }
  });

  it('should have no accessibility violations', async () => {
    renderDesign();
    await screen.findByRole('heading', { level: 1, name: 'Design' });

    expect(await violations()).toEqual([]);
  });

  it('should have no accessibility violations with the menu open', async () => {
    renderDesign();

    fireEvent.keyDown(await screen.findByRole('button', { name: 'Ações' }), {
      key: 'Enter',
    });
    await screen.findByRole('menu');

    expect(await violations()).toEqual([]);
  });

  it('should have no accessibility violations with the dialog open', async () => {
    renderDesign();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Arquivar curso' }),
    );
    await screen.findByRole('dialog');

    expect(await violations()).toEqual([]);
  });
});
