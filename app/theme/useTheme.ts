import { useContext } from 'react';

import { ThemeContext } from '~/theme/ThemeProvider';

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('Cannot use `useTheme` outside `ThemeProvider`.');
  }

  return value;
}
