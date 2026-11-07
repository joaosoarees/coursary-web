import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StudentsTable } from '~/instructor/students/StudentsTable';
import type { Student } from '~/services/StudentService';

const students: Student[] = [
  {
    accountId: 'a1',
    studentName: 'Larissa Monteiro',
    enrolledAt: '2026-11-06T12:00:00.000Z',
    completedLessons: 4,
  },
  {
    accountId: 'a2',
    studentName: 'Carlos Siqueira',
    enrolledAt: '2026-11-05T12:00:00.000Z',
    completedLessons: 13,
  },
];

const renderTable = (order: 'asc' | 'desc' = 'desc') => {
  const onSort = vi.fn();
  render(
    <StudentsTable
      students={students}
      lessonCount={12}
      order={order}
      onSort={onSort}
      busy={false}
    />,
  );

  return onSort;
};

describe('StudentsTable', () => {
  it('should list each student with the enrollment date and the progress', () => {
    renderTable();
    const [, first, second] = screen.getAllByRole('row');

    if (!first) {
      throw new Error('No student row.');
    }

    expect(first).toHaveTextContent('Larissa Monteiro');
    expect(first).toHaveTextContent('4 de 12 aulas');
    expect(within(first).getAllByText(/6 de nov\. de 2026/)).not.toHaveLength(
      0,
    );
    expect(second).toHaveTextContent('Concluído');
  });

  it('should say the order of the enrollment column', () => {
    renderTable();

    expect(
      screen.getByRole('columnheader', { name: /Matriculado em/ }),
    ).toHaveAttribute('aria-sort', 'descending');
    expect(
      screen.getByRole('columnheader', { name: 'Aluno' }),
    ).not.toHaveAttribute('aria-sort');
  });

  it('should ask for the oldest first, then the newest first', () => {
    const onSortDesc = renderTable('desc');
    fireEvent.click(
      screen.getByRole('button', { name: /Matriculado em, mais recentes/ }),
    );
    expect(onSortDesc).toHaveBeenCalledWith('asc');
  });

  it('should ask for the newest first when the oldest are on screen', () => {
    const onSort = renderTable('asc');
    fireEvent.click(
      screen.getByRole('button', { name: /Matriculado em, mais antigos/ }),
    );
    expect(onSort).toHaveBeenCalledWith('desc');
  });
});
