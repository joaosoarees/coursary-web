import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CourseProgress } from '~/components/course/CourseProgress';

const solidSegments = (container: HTMLElement) =>
  [...container.querySelectorAll('.grid path')].filter(
    (path) => path.getAttribute('stroke-dasharray') !== '3 5',
  ).length;

describe('CourseProgress', () => {
  it('should draw the share of lessons done in six segments', () => {
    const { container } = render(<CourseProgress completed={10} total={42} />);

    expect(solidSegments(container)).toBe(1);
    expect(screen.getByText(/10 de 42 aulas/)).toHaveTextContent(
      '10 de 42 aulas concluídas',
    );
  });

  it('should say the course is done when every lesson is', () => {
    const { container } = render(<CourseProgress completed={24} total={24} />);

    expect(solidSegments(container)).toBe(6);
    expect(screen.getByText('Concluído')).toBeVisible();
  });

  it('should draw nothing done for a course with no lessons', () => {
    const { container } = render(<CourseProgress completed={0} total={0} />);

    expect(solidSegments(container)).toBe(0);
    expect(screen.getByText(/0 de 0 aulas/)).toBeVisible();
  });

  it('should show a started course as started', () => {
    const { container } = render(<CourseProgress completed={1} total={42} />);

    expect(solidSegments(container)).toBe(1);
  });

  it('should leave a segment open until the last lesson is done', () => {
    const { container } = render(<CourseProgress completed={41} total={42} />);

    expect(solidSegments(container)).toBe(5);
    expect(screen.queryByText('Concluído')).toBeNull();
  });

  it('should say a course was never started where asked to', () => {
    render(<CourseProgress completed={0} total={8} notStarted="Não começou" />);

    expect(screen.getByText('Não começou')).toBeVisible();
    expect(screen.queryByText(/0 de 8 aulas/)).toBeNull();
  });
});
