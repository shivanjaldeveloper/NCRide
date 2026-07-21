import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Base design dimensions (iPhone 14 Pro = 393 x 852)
const BASE_W = 393;
const BASE_H = 852;

export const fscale = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel((size * SCREEN_W) / BASE_W));

export const vscale = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel((size * SCREEN_H) / BASE_H));

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

// ─── Palette ───────────────────────────────────────────────────────────────
// Matches the NCRide design reference token set (`T`) 1:1.
export const Colors = {
  // Brand / ink scale
  primary: '#0F1115', // ink — buttons, key text
  ink: '#0F1115',
  ink2: '#2A2D33',

  // Accent
  accent: '#C8F260', // lime
  lime: '#C8F260',
  accentSoft: '#EEF8D6', // light lime tint for badges/banners
  blue: '#2E7DFF',
  cyan: '#00C2D7',
  amber: '#F2A03D',

  // Backgrounds
  bgWhite: '#FFFFFF',
  bgOffWhite: '#F4F4F2', // T.bg
  bgLight: '#ECECEA', // T.bg2
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.65)',

  // Splash gradient / dark surfaces
  splashTop: '#0F1115',
  splashMid: '#0F1115',
  splashBot: '#0F1115',

  // Text
  textPrimary: '#0F1115', // T.ink
  textSecondary: '#6B6F77', // T.mute
  textTertiary: '#9CA1AA', // T.mute2
  textInverse: '#FFFFFF',

  // UI
  border: 'rgba(15,17,21,0.08)', // T.line
  borderSoft: 'rgba(15,17,21,0.04)', // T.line2
  borderFocus: '#0F1115',
  inputBg: '#FFFFFF',
  pillBg: 'rgba(15,17,21,0.04)',

  // Status
  green: '#1F9D6B',
  red: '#E0524E',

  // Map tones
  map: '#E7ECEE',
  mapRoad: '#FFFFFF',
  mapRoadMinor: '#F5F1EA',
  mapLand: '#EFF2EE',
  mapWater: '#CFE3EE',
  mapGreen: '#DFE9D7',
  mapBlue: '#CFE3EE',

  transparent: 'transparent',
} as const;

// ─── Typography ────────────────────────────────────────────────────────────
export const Typography = {
  h1: { fontSize: fscale(28), fontWeight: '700' as const, letterSpacing: -1 },
  h2: { fontSize: fscale(24), fontWeight: '700' as const, letterSpacing: -0.5 },
  h3: { fontSize: fscale(20), fontWeight: '700' as const, letterSpacing: -0.3 },
  h4: { fontSize: fscale(17), fontWeight: '600' as const, letterSpacing: -0.2 },
  body: {
    fontSize: fscale(15),
    fontWeight: '400' as const,
    lineHeight: fscale(22),
  },
  bodySmall: {
    fontSize: fscale(13),
    fontWeight: '400' as const,
    lineHeight: fscale(18),
  },
  label: {
    fontSize: fscale(11),
    fontWeight: '600' as const,
    letterSpacing: 0.8,
  },
  caption: { fontSize: fscale(12), fontWeight: '400' as const },
  button: {
    fontSize: fscale(16),
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────
export const Spacing = {
  xs: fscale(4),
  sm: fscale(8),
  md: fscale(12),
  lg: fscale(16),
  xl: fscale(20),
  xxl: fscale(24),
  xxxl: fscale(32),
  screen: fscale(18), // standard horizontal screen padding (matches HeaderBack inset)
} as const;

// ─── Radii ─────────────────────────────────────────────────────────────────
export const Radii = {
  xs: fscale(4),
  sm: fscale(8),
  md: fscale(12),
  lg: fscale(14),
  xl: fscale(20),
  xxl: fscale(28),
  pill: fscale(100),
  circle: 9999,
} as const;

// ─── Shadows ───────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  strong: {
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 6,
  },
  button: {
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
} as const;
