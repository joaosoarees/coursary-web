import { redirect } from 'react-router';

export function clientLoader() {
  return redirect('/cursos');
}

export default function Home() {
  return null;
}
