import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  StudentsExportButton,
  StudentsExportStatus,
} from '~/instructor/students/StudentsExport';
import type {
  StudentExportPhase,
  useStudentExport,
} from '~/instructor/students/useStudentExport';

const csvIn = (
  phase: StudentExportPhase,
  extra: { notice?: string; problem?: string } = {},
): ReturnType<typeof useStudentExport> => ({
  phase,
  notice: extra.notice,
  problem: extra.problem,
  start: vi.fn(() => Promise.resolve()),
});

describe('StudentsExportButton', () => {
  it('should start the export', () => {
    const csv = csvIn({ step: 'idle' });
    render(<StudentsExportButton csv={csv} />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    expect(csv.start).toHaveBeenCalled();
  });

  it('should not start twice while the file is prepared', () => {
    const csv = csvIn({ step: 'preparing' });
    render(<StudentsExportButton csv={csv} />);

    fireEvent.click(screen.getByRole('button', { name: 'Preparando o CSV…' }));

    expect(csv.start).not.toHaveBeenCalled();
  });

  it('should offer the ready file as a download', () => {
    render(
      <StudentsExportButton
        csv={csvIn({
          step: 'ready',
          url: 'https://bucket.example/e1.csv',
          rowCount: 47,
          expiresIn: 300,
        })}
      />,
    );

    expect(screen.getByRole('link', { name: 'Baixar CSV' })).toHaveAttribute(
      'href',
      'https://bucket.example/e1.csv',
    );
  });
});

describe('StudentsExportStatus', () => {
  it('should say how many students the file has and how long the link lasts', () => {
    render(
      <StudentsExportStatus
        csv={csvIn({
          step: 'ready',
          url: 'https://bucket.example/e1.csv',
          rowCount: 47,
          expiresIn: 300,
        })}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'O CSV de 47 alunos está pronto. O link vale por 5 minutos; depois, exporte de novo.',
    );
  });

  it('should show a refusal as an alert', () => {
    render(
      <StudentsExportStatus
        csv={csvIn({ step: 'idle' }, { problem: 'Não deu para preparar.' })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não deu para preparar.',
    );
  });
});
