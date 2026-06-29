import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing, fscale } from '../../theme';
import Icon from '../common/Icon';

interface Props {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  sub?: string;
}

/**
 * HeaderBack
 * Standard "← Title" header used on every pushed screen (Book, Ride,
 * Tracking, Activity detail, Account sub-pages, etc). RN port of the
 * reference `HeaderBack`. Pairs with ScreenShell — the 64px top padding from
 * the web mock is handled by ScreenShell's safe-area inset, so this
 * component only needs a small top gap.
 */
const HeaderBack = ({ title, onBack, right, sub }: Props) => {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={onBack} activeOpacity={0.75} style={styles.backBtn}>
        <Icon name="chevronLeft" size={20} stroke={Colors.ink} sw={2} />
      </TouchableOpacity>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {sub ? (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: fscale(18),
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: fscale(12),
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default HeaderBack;
