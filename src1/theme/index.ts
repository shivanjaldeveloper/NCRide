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
export const Colors = {
  // Brand
  primary: '#1C1C1E', // near-black (buttons, key text)
  accent: '#C8FF00', // electric lime-green (OTP digits, highlights)
  accentSoft: '#E8F5C8', // light tint for badge bg

  // Backgrounds
  bgWhite: '#FFFFFF',
  bgOffWhite: '#F5F5F5',
  bgLight: '#F0F0EC',

  // Splash gradient stops
  splashTop: '#1A2B1A',
  splashMid: '#0D1B2A',
  splashBot: '#0A1520',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#6B6B6B',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',

  // UI
  border: '#E5E5EA',
  borderFocus: '#1C1C1E',
  inputBg: '#FFFFFF',
  pillBg: '#F2F2F7',

  // Status
  green: '#34C759',
  red: '#FF3B30',
  blue: '#007AFF',

  // Map tones
  mapRoad: '#FFFFFF',
  mapGreen: '#D4E8C2',
  mapBlue: '#C8DFF5',

  transparent: 'transparent',
} as const;

// ─── Typography ────────────────────────────────────────────────────────────
export const Typography = {
  h1: { fontSize: fscale(28), fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: fscale(24), fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: fscale(20), fontWeight: '700' as const },
  h4: { fontSize: fscale(17), fontWeight: '600' as const },
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
  button: { fontSize: fscale(16), fontWeight: '700' as const },
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
  screen: fscale(20), // standard horizontal screen padding
} as const;

// ─── Radii ─────────────────────────────────────────────────────────────────
export const Radii = {
  xs: fscale(4),
  sm: fscale(8),
  md: fscale(12),
  lg: fscale(16),
  xl: fscale(20),
  xxl: fscale(28),
  pill: fscale(100),
  circle: 9999,
} as const;

// ─── Shadows ───────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
