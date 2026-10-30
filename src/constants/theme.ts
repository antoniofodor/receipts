import { Platform } from 'react-native';

export const Colors = {
  background: '#FFE9DF',
  card: '#FFFFFF',
  ink: '#1A1414',
  muted: '#8A7F7B',
  line: '#E2D9D5',
  soft: '#FFF1EA',
  accent: '#FF3D7F',
  accentSoft: '#FFD3E2',
  onAccent: '#FFFFFF',
  plus: '#159A62',
  minus: '#E0365A',
  danger: '#C62828',
} as const;

export const Fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const ScreenBottomSpace = 48;

export const Radius = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;
