import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CoverCard } from '~/instructor/CoverCard';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';

const course: ManagedCourse = {
  id: 'c1',
  instructorId: 'i1',
  title: 'Gráficos que contam uma história',
  description: '',
  status: 'DRAFT',
  lessonCount: 0,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
};

const renderCard = (props: { course?: ManagedCourse; readOnly?: boolean }) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CoverCard
        course={props.course ?? course}
        readOnly={props.readOnly ?? false}
      />
    </QueryClientProvider>,
  );

const png = () =>
  new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    'capa.png',
    { type: 'image/png' },
  );

describe('CoverCard', () => {
  it('should offer to send a cover, or to replace the one there is', () => {
    const { unmount } = renderCard({});

    expect(screen.getByRole('button', { name: 'Enviar capa' })).toBeVisible();

    unmount();
    renderCard({
      course: { ...course, coverUrl: { '480': 'https://cdn.example/a.webp' } },
    });

    expect(screen.getByRole('button', { name: 'Trocar capa' })).toBeVisible();
  });

  it('should offer nothing on an archived course', () => {
    renderCard({ readOnly: true });

    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('input[type=file]')).toBeNull();
  });

  it('should ignore the button while a cover is being sent', async () => {
    vi.spyOn(InstructorService, 'requestCoverUpload').mockReturnValue(
      new Promise(() => undefined),
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: () => 'blob:preview',
      revokeObjectURL: () => undefined,
    });
    renderCard({});
    const input = document.querySelector<HTMLInputElement>('input[type=file]');

    if (!input) {
      throw new Error('The card has no file input.');
    }

    const pick = vi.spyOn(input, 'click');

    fireEvent.change(input, { target: { files: [png()] } });
    const button = await screen.findByRole('button', { name: /Enviando/ });
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(pick).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Enviando a capa…');
  });
});
