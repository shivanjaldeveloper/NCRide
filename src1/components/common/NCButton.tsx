import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Radii, fscale } from '../../theme';

type Variant = 'primary' | 'outline' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const NCButton = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
}: Props) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        fullWidth && styles.full,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.textInverse : Colors.primary} size="small" />
      ) : (
        <>
          <Text
            style={[
              styles.label,
              isPrimary && styles.labelPrimary,
              isOutline && styles.labelOutline,
              variant === 'ghost' && styles.labelGhost,
              textStyle,
            ]}>
            {label}
          </Text>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: fscale(52),
    borderRadius: Radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: fscale(8),
    paddingHorizontal: fscale(24),
  },
  full: { width: '100%' },
  primary: { backgroundColor: Colors.primary },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: { backgroundColor: Colors.transparent },
  disabled: { opacity: 0.45 },
  label: { ...Typography.button },
  labelPrimary: { color: Colors.textInverse },
  labelOutline: { color: Colors.textPrimary },
  labelGhost: { color: Colors.textPrimary },
});

export default NCButton;
