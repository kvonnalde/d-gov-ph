import { createDarkTheme, createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

export const palette = {
  primary: '#087E8B',
  accent: '#C15B3E',
  surface: '#F5F7F6',
  text: '#1D2D2C',
  muted: '#637472',
  border: '#D8E1DF',
} as const;

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

function mixWithWhite(color: string, ratio: number): string {
  const [red, green, blue] = hexToRgb(color);
  return rgbToHex(red + (255 - red) * ratio, green + (255 - green) * ratio, blue + (255 - blue) * ratio);
}

function mixWithBlack(color: string, ratio: number): string {
  const [red, green, blue] = hexToRgb(color);
  return rgbToHex(red * (1 - ratio), green * (1 - ratio), blue * (1 - ratio));
}

const brandRamp: BrandVariants = {
  10: mixWithWhite(palette.primary, 0.95),
  20: mixWithWhite(palette.primary, 0.89),
  30: mixWithWhite(palette.primary, 0.82),
  40: mixWithWhite(palette.primary, 0.75),
  50: mixWithWhite(palette.primary, 0.65),
  60: mixWithWhite(palette.primary, 0.55),
  70: mixWithWhite(palette.primary, 0.42),
  80: mixWithWhite(palette.primary, 0.28),
  90: mixWithWhite(palette.primary, 0.12),
  100: palette.primary,
  110: mixWithBlack(palette.primary, 0.12),
  120: mixWithBlack(palette.primary, 0.24),
  130: mixWithBlack(palette.primary, 0.36),
  140: mixWithBlack(palette.primary, 0.48),
  150: mixWithBlack(palette.primary, 0.6),
  160: mixWithBlack(palette.primary, 0.72),
};

const fontFamily = '"Segoe UI Variable", "Segoe UI", "Source Sans 3", system-ui, sans-serif';

function withPalette(theme: Theme, dark: boolean): Theme {
  return {
    ...theme,
    fontFamilyBase: fontFamily,
    fontFamilyMonospace: 'Consolas, "Courier New", monospace',
    colorNeutralBackground1: dark ? '#172321' : '#FFFFFF',
    colorNeutralBackground2: dark ? '#1D2D2C' : palette.surface,
    colorNeutralBackground3: dark ? '#263735' : '#EDF1EF',
    colorNeutralForeground1: dark ? '#F5F7F6' : palette.text,
    colorNeutralForeground2: dark ? '#B2C0BE' : palette.muted,
    colorNeutralStroke1: dark ? '#394B49' : palette.border,
    colorNeutralStroke2: dark ? '#2E403E' : '#E5EBE9',
    colorBrandBackground: palette.primary,
    colorBrandBackgroundHover: '#066D78',
    colorBrandForeground1: dark ? '#43B9C2' : palette.primary,
  };
}

export const lightTheme = withPalette(createLightTheme(brandRamp), false);
export const darkTheme = withPalette(createDarkTheme(brandRamp), true);