import type { TextStyle } from 'react-native';

// "Rundown" look from concepts-rundown.html (RUNDOWN-DESIGN.md). Everything the group writes is on paper,
// which looks the same day and night; only the ground around it changes with the light.
export const Paper = {
  paper: '#FBF6E8',
  ink: '#1F1C18',
  red: '#B3261E',
  green: '#2F7A4B',
  muted: '#6A6358',
  dots: '#CFC7B4',
  rule: '#D3CAB6',
  highlight: '#F6E3A6',
  tape: '#E9DFC2',
  field: '#F3EDDC',
  fieldLine: '#CFC7B4',
} as const;

// Wear and tear on the receipts. Decoration only, so it stays faint enough never to hide what's printed.
export const Wear = {
  tape: 'rgba(233, 223, 194, 0.85)',
  print: '#FDFCF7',
  printShadow: '0px 6px 12px rgba(0, 0, 0, 0.25)',
  yellowedTop: 'rgba(214, 190, 130, 0.22)',
  yellowedBottom: 'rgba(214, 190, 130, 0.25)',
  // The torn teeth are drawn solid, in the paper's colour with the yellowing already on it.
  yellowedEdgeTop: '#F3EAD2',
  yellowedEdgeBottom: '#F2E8CF',
  creaseShadow: 'rgba(0, 0, 0, 0.04)',
  creaseLight: 'rgba(255, 255, 255, 0.5)',
  creaseFaint: 'rgba(0, 0, 0, 0.03)',
  ductTape: ['#A9A9A4', '#9C9C97'],
  tapeShadow: '0px 1px 2px rgba(0, 0, 0, 0.15)',
  labelShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  // The counter behind the shared picture is always the daytime one, so a shared receipt looks the same at any hour.
  counter: '#D9D2C3',
} as const;

export type GroundPalette = {
  ground: string;
  text: string;
  textMuted: string;
  error: string;
  line: string;
  stain: string;
  streetlight: string | null;
  neon: string;
  neonLit: boolean;
  neonGlow: string | null;
  pumpBody: readonly [top: string, bottom: string];
  pumpEdge: string;
  pumpLabel: string;
  display: string;
  led: string;
  ledGlow: string;
  ledNegative: string;
  ledNegativeGlow: string;
  primary: string;
  onPrimary: string;
  primaryEdge: string;
  approve: string;
  onApprove: string;
  approveEdge: string;
  decline: string;
  onDecline: string;
  declineEdge: string;
  navBackground: string;
  navBorder: string;
  navBorderWidth: number;
  navIcon: string;
  navActive: string;
  signFrame: string;
  signBody: string;
  signGlow: string | null;
  cardShadow: string;
};

// The plastic sign letters are the same white tiles day and night.
export const SignTiles = {
  tile: '#FFFFFF',
  tileEdge: '#CFC9BC',
  tileLetter: '#141414',
  tileBack: '#2A2724',
} as const;

const sharedGround = {
  pumpLabel: '#9C968A',
  ledNegative: '#FF4A3D',
  ledNegativeGlow: 'rgba(255, 74, 61, 0.6)',
} as const;

export const Ground: Record<'day' | 'night', GroundPalette> = {
  day: {
    ...sharedGround,
    ground: '#D9D2C3',
    text: '#2A2622',
    textMuted: '#5C554B',
    // Darker than the paper red, which falls just short of 4.5:1 on the daytime concrete.
    error: '#9A2019',
    line: 'rgba(42, 38, 34, 0.25)',
    stain: 'rgba(45, 38, 30, 0.14)',
    streetlight: null,
    neon: '#8E6A63',
    neonLit: false,
    neonGlow: null,
    pumpBody: ['#B04C40', '#8F3C32'],
    pumpEdge: '#6E2C24',
    display: '#0D0D0C',
    led: '#FFB627',
    ledGlow: 'rgba(255, 182, 39, 0.6)',
    primary: '#F2C230',
    onPrimary: '#1F1C18',
    primaryEdge: '#1F1C18',
    approve: '#3F8A5A',
    onApprove: '#FFFFFF',
    approveEdge: '#28603C',
    decline: '#B3261E',
    onDecline: '#FFFFFF',
    declineEdge: '#7A1912',
    navBackground: '#C3BDB0',
    navBorder: '#6D675C',
    navBorderWidth: 3,
    navIcon: '#4E483F',
    navActive: '#B3261E',
    signFrame: '#B4463A',
    signBody: '#F4F1E8',
    signGlow: null,
    cardShadow: '0px 6px 10px rgba(50, 40, 25, 0.22)',
  },
  night: {
    ...sharedGround,
    ground: '#15161A',
    text: '#F1E9D8',
    textMuted: '#B9AE9A',
    error: '#FF4A5A',
    line: 'rgba(241, 233, 216, 0.25)',
    stain: 'rgba(120, 140, 190, 0.08)',
    streetlight: 'rgba(255, 150, 60, 0.22)',
    neon: '#FF4A5A',
    neonLit: true,
    neonGlow: '0px 0px 14px rgba(255, 74, 90, 0.5), inset 0px 0px 10px rgba(255, 74, 90, 0.3)',
    pumpBody: ['#34363C', '#24262B'],
    pumpEdge: '#43464D',
    display: '#050506',
    led: '#FF9D3A',
    ledGlow: 'rgba(255, 157, 58, 0.7)',
    primary: '#FF9D3A',
    onPrimary: '#15161A',
    primaryEdge: '#7A4310',
    approve: '#3FBF73',
    onApprove: '#0B1F12',
    approveEdge: '#22703F',
    decline: '#FF4A5A',
    onDecline: '#24070B',
    declineEdge: '#93202C',
    navBackground: '#1B1C20',
    navBorder: '#FF4A5A',
    navBorderWidth: 2,
    navIcon: '#A59C8C',
    navActive: '#FF9D3A',
    signFrame: '#2B2D33',
    signBody: '#FFF8E6',
    signGlow: '0px 0px 18px rgba(255, 248, 230, 0.35)',
    cardShadow: '0px 10px 18px rgba(0, 0, 0, 0.55)',
  },
};

// Custom fonts pick their weight by family name, not fontWeight, so each weight is its own family.
export const Fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  semiBold: 'JetBrainsMono_600SemiBold',
  bold: 'JetBrainsMono_700Bold',
  heavy: 'JetBrainsMono_800ExtraBold',
  displaySemiBold: 'BarlowCondensed_600SemiBold',
  displayBold: 'BarlowCondensed_700Bold',
  display: 'BarlowCondensed_800ExtraBold',
  marker: 'PermanentMarker_400Regular',
} as const;

export const Type = {
  heading: { fontFamily: Fonts.display, fontSize: 30, lineHeight: 32, textTransform: 'uppercase', color: Paper.ink },
  body: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 21, color: Paper.ink },
  muted: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 19, color: Paper.muted },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: Paper.muted,
  },
  name: { fontFamily: Fonts.display, fontSize: 24, lineHeight: 26, textTransform: 'uppercase', color: Paper.ink },
  lineItem: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 19, textTransform: 'uppercase', color: Paper.ink },
  points: { fontFamily: Fonts.heavy, fontSize: 20, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  signLetter: { fontFamily: Fonts.display, textTransform: 'uppercase', color: SignTiles.tileLetter },
  tape: { fontFamily: Fonts.marker, fontSize: 17, color: Paper.ink },
  // Text on the ground leaves out its colour, which comes from the palette for the current light.
  key: { fontFamily: Fonts.display, fontSize: 20, letterSpacing: 1.5, textTransform: 'uppercase' },
  backLink: { fontFamily: Fonts.displayBold, fontSize: 17, letterSpacing: 1.5, textTransform: 'uppercase' },
  tabLabel: { fontFamily: Fonts.displayBold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
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
  tile: 2,
  key: 8,
  display: 6,
  pump: 12,
} as const;

// One set of springs for the whole app, so everything moves alike.
export const Springs = {
  press: { damping: 15, stiffness: 400, mass: 0.6 },
  settle: { damping: 18, stiffness: 180 },
} as const;
