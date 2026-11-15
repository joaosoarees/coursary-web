import { create } from 'storybook/theming/create';

// The manager does not load the app's fonts, so it names the system stack.
export default create({
  base: 'light',

  brandTitle: 'Coursary UI',

  colorPrimary: '#1f3a2e',
  colorSecondary: '#2b6b52',

  appBg: '#f3f5f1',
  appContentBg: '#ffffff',
  appBorderColor: '#cfd9d1',
  appBorderRadius: 8,

  fontBase: 'system-ui, sans-serif',
  fontCode: 'ui-monospace, monospace',

  textColor: '#13241b',
  textMutedColor: '#47594f',
  textInverseColor: '#f3f5f1',

  barBg: '#ffffff',
  barTextColor: '#47594f',
  barSelectedColor: '#2b6b52',
  barHoverColor: '#1f3a2e',

  inputBorder: '#7d9186',
  inputTextColor: '#13241b',
  inputBorderRadius: 6,
});
