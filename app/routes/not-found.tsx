import { data } from 'react-router';

// Any address no route matches answers 404 inside the layout, with the navigation.
export function clientLoader() {
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router reads a thrown data() as a 404 response.
  throw data(null, { status: 404 });
}

export default function NotFound() {
  return null;
}
