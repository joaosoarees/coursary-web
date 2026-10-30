export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<Theme, 'system'>;

export const THEMES: readonly string[] = [
  'light',
  'dark',
  'system',
] satisfies Theme[];
export const THEME_STORAGE_KEY = 'coursary-theme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

// Runs in <head> before the first paint, so a dark choice never shows a light page first. It
// accepts the same values as ThemeProvider and falls back to the same default.
export const themeScript = `(function () {
  var theme = 'system';
  try {
    var stored = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    if (${JSON.stringify(THEMES)}.indexOf(stored) !== -1) theme = stored;
  } catch (error) {}
  if (theme === 'system') {
    theme = window.matchMedia('${DARK_QUERY}').matches ? 'dark' : 'light';
  }
  document.documentElement.classList.add(theme);
})();`;
