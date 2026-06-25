import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, fscale } from '../../theme';
import Icon from './Icon';
import { IconName } from './iconPaths';

export type NCButtonVariant =
  | 'primary'
  | 'accent'
  | 'blue'
  | 'glass'
  | 'ghost'
  | 'danger'
  // Legacy alias kept for screens not yet ported to the new design pass
  // (Phase 1 will replace these call sites and this alias can be removed).
  | 'outline';

export type NCButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: NCButtonVariant;
  size?: NCButtonSize;
  icon?: IconName | string;
  iconRight?: IconName | string;
  iconColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

// Matches the reference Btn's `sizes` map (h / px / fs / r).
const SIZES: Record<
  NCButtonSize,
  { h: number; px: number; fs: number; r: number }
> = {
  sm: { h: fscale(36), px: fscale(14), fs: fscale(14), r: fscale(12) },
  md: { h: fscale(48), px: fscale(18), fs: fscale(15), r: fscale(14) },
  lg: { h: fscale(56), px: fscale(22), fs: fscale(16), r: fscale(18) },
};

// Matches the reference Btn's `variants` map (bg / color / border / shadow).
const VARIANTS: Record<
  NCButtonVariant,
  { bg: string; color: string; border?: { width: number; color: string } }
> = {
  primary: { bg: Colors.ink, color: '#FFFFFF' },
  accent: { bg: Colors.lime, color: Colors.ink },
  blue: { bg: Colors.blue, color: '#FFFFFF' },
  glass: {
    bg: 'rgba(255,255,255,0.7)',
    color: Colors.ink,
    border: { width: 0.5, color: 'rgba(15,17,21,0.08)' },
  },
  ghost: {
    bg: 'transparent',
    color: Colors.ink,
    border: { width: 1, color: 'rgba(15,17,21,0.12)' },
  },
  outline: {
    bg: 'transparent',
    color: Colors.ink,
    border: { width: 1.5, color: Colors.border },
  },
  danger: { bg: Colors.red, color: '#FFFFFF' },
};

/**
 * NCButton
 * RN port of the design reference's `Btn` component. Same variant/size
 * vocabulary so screens map 1:1 from the mock.
 */
const NCButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  iconColor,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: Props) => {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          height: s.h,
          paddingHorizontal: s.px,
          borderRadius: s.r,
          backgroundColor: v.bg,
          borderWidth: v.border?.width ?? 0,
          borderColor: v.border?.color,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        variant !== 'ghost' &&
          variant !== 'glass' &&
          variant !== 'outline' &&
          styles.shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.color} size="small" />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon}
              size={18}
              stroke={iconColor || v.color}
              sw={1.8}
            />
          )}
          <Text
            style={[
              styles.label,
              { color: v.color, fontSize: s.fs },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {iconRight && (
            <Icon
              name={iconRight}
              size={18}
              stroke={iconColor || v.color}
              sw={1.8}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: fscale(8),
  },
  shadow: {
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

export default NCButton;
