import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

export function BackToMyCourses() {
  return (
    <Link
      to="/instrutor/cursos"
      className="inline-flex min-h-10 items-center gap-1.5 self-start font-bold text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      Meus cursos
    </Link>
  );
}
