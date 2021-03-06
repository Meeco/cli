import { create } from '@storybook/theming/create';

import logo from '../assets/secondary-logo.png';

export default create({
  base: 'light',

  colorPrimary: '#e61e3d',
  colorSecondary: '#43bfde', // Color of the selected item in the left menu

  // UI
  appBg: '#f7f7f7',
  appContentBg: 'white',
  appBorderColor: 'white',
  appBorderRadius: 16,

  // Typography
  fontBase:
    '"Euclid Circular B", "Euclid", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
  // fontCode: 'monospace',

  // Text colors
  textColor: '#555555',
  textInverseColor: 'rgba(255,255,255,0.9)',

  // Toolbar default and active colors
  barTextColor: '#555555',
  barSelectedColor: '#e61e3d',
  barBg: '#FDE9EC',

  // Form colors
  inputBg: 'white',
  inputBorder: 'silver',
  inputTextColor: 'black',
  // inputBorderRadius: 4,

  brandTitle: 'Meeco Style Kit',
  brandUrl: 'https://meeco.me',
  brandImage: logo
});
