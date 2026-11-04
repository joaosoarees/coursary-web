import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LessonCompletion } from '~/components/lesson/LessonCompletion';

describe('LessonCompletion', () => {
  it('should complete the lesson when the box is ticked', () => {
    const onComplete = vi.fn();
    render(
      <LessonCompletion done={false} pending={false} onComplete={onComplete} />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Marcar concluída' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should ask only once while the completion is being saved', () => {
    const onComplete = vi.fn();
    render(<LessonCompletion done={false} pending onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Salvando…' }));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should show a done lesson as a status that takes no action', () => {
    render(<LessonCompletion done pending={false} onComplete={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Concluída');
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});
