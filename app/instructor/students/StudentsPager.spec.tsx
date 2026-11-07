import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  StudentsPager,
  StudentsRange,
} from '~/instructor/students/StudentsPager';

describe('StudentsRange', () => {
  it('should count the students and pages from the course total', () => {
    expect(StudentsRange.of(1, 20, 47)).toEqual({
      text: 'Mostrando 21–40 de 47',
      pages: 3,
    });
  });

  it('should never count fewer students than the pages have shown', () => {
    expect(StudentsRange.of(2, 9, 45)).toEqual({
      text: 'Mostrando 41–49 de 49',
      pages: 3,
    });
  });
});

describe('StudentsPager', () => {
  it('should move between pages only where a page exists', () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <StudentsPager
        index={0}
        shown={20}
        total={47}
        canNext
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    expect(screen.getByText('Página 1 de 3')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(onNext).toHaveBeenCalled();
  });
});
