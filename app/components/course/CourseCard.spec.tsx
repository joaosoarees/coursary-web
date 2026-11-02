import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { CourseCard } from '~/components/course/CourseCard';
import type { CatalogItem } from '~/services/CatalogService';

const course: CatalogItem = {
  id: 'c1',
  title: 'Python para análise de dados',
  instructorName: 'Juliana Prado',
  lessonCount: 10,
  enrollmentCount: 221,
  ratingCount: 36,
  ratingAverage: 4.75,
  publishedAt: '2026-10-01T00:00:00.000Z',
};

const renderCard = (overrides: Partial<CatalogItem> = {}) =>
  render(
    <MemoryRouter>
      <CourseCard course={{ ...course, ...overrides }} />
    </MemoryRouter>,
  );

describe('CourseCard', () => {
  it('should lead to the course page with its numbers', () => {
    renderCard();

    const link = screen.getByRole('link', {
      name: /Python para análise de dados/,
    });
    expect(link).toHaveAttribute('href', '/cursos/c1');
    expect(link).toHaveTextContent('Nota 4,8 (36)');
    expect(link).toHaveTextContent('10 aulas');
    expect(link).toHaveTextContent('221 alunos');
  });

  it('should say when there is no review yet', () => {
    renderCard({ ratingAverage: null, ratingCount: 0 });

    expect(screen.getByText('Sem avaliações')).toBeVisible();
  });

  it('should count one lesson and one student in the singular', () => {
    renderCard({ lessonCount: 1, enrollmentCount: 1 });

    expect(screen.getByText('1 aula')).toBeVisible();
    expect(screen.getByText('1 aluno')).toBeVisible();
  });

  it('should show the uploaded cover in both sizes', () => {
    const { container } = renderCard({
      coverUrl: {
        '480': 'https://cdn.test/480.webp',
        '1280': 'https://cdn.test/1280.webp',
      },
    });

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://cdn.test/480.webp');
    expect(image).toHaveAttribute(
      'srcset',
      'https://cdn.test/480.webp 480w, https://cdn.test/1280.webp 1280w',
    );
  });

  it('should write the title on a chalk plate without a cover', () => {
    const { container } = renderCard();

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      'Python para análise de dados',
    );
  });
});
