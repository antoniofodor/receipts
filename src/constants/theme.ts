import type { TextStyle } from 'react-native';

// "Thermal" look from concepts-receipt.html: receipts printed in black and red ink on a grey counter.
export const Colors = {
  background: '#EAE9E4',
  card: '#FBFBF8',
  ink: '#151515',
  muted: '#8B8A84',
  line: '#CBCAC2',
  soft: '#F1F0EB',
  accent: '#151515',
  onAccent: '#FBFBF8',
  red: '#D62A1E',
  plus: '#151515',
  minus: '#D62A1E',
  danger: '#D62A1E',
  pump: '#0E0E0E',
  pumpEdge: '#2A2A2A',
  pumpLabel: '#7C7A72',
  pumpLed: '#FF4A3D',
  pumpLight: '#F1F0EA',
  pumpLedGlow: 'rgba(255, 74, 61, 0.6)',
  pumpLightGlow: 'rgba(241, 240, 234, 0.35)',
} as const;

// Custom fonts pick their weight by family name, not fontWeight, so each weight is its own family.
export const Fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  semiBold: 'JetBrainsMono_600SemiBold',
  bold: 'JetBrainsMono_700Bold',
  heavy: 'JetBrainsMono_800ExtraBold',
  display: 'BarlowCondensed_800ExtraBold',
} as const;

export const Type = {
  display: { fontFamily: Fonts.display, fontSize: 46, lineHeight: 46, textTransform: 'uppercase', color: Colors.ink },
  heading: { fontFamily: Fonts.display, fontSize: 30, lineHeight: 32, textTransform: 'uppercase', color: Colors.ink },
  body: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 21, color: Colors.ink },
  muted: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 19, color: Colors.muted },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  name: { fontFamily: Fonts.bold, fontSize: 13.5, letterSpacing: 0.3, textTransform: 'uppercase', color: Colors.ink },
  lineItem: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 19, textTransform: 'uppercase', color: Colors.ink },
  points: { fontFamily: Fonts.heavy, fontSize: 20, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  button: { fontFamily: Fonts.bold, fontSize: 12.5, letterSpacing: 1.6, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

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
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

// One set of springs for the whole app, so everything moves alike.
export const Springs = {
  press: { damping: 15, stiffness: 400, mass: 0.6 },
  settle: { damping: 18, stiffness: 180 },
} as const;
