import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii, fscale } from '../../theme';
import Icon from '../common/Icon';

interface Props {
  pickup: string;
  drop: string;
  onPickupPress?: () => void;
  onDropPress?: () => void;
  onSwap?: () => void;
  // True when the shown text is a placeholder ("Add pickup location") not
  // a real chosen address — dims the text so it reads as a prompt rather
  // than a confirmed selection, matching HomeScreen's own pickup/drop rows.
  pickupIsPlaceholder?: boolean;
  dropIsPlaceholder?: boolean;
}

/**
 * LocFieldStack
 * The pickup/drop two-row card with a dotted connector line and optional
 * swap button, used on Ride/Book screens. RN port of the reference
 * `LocFieldStack`.
 */
const LocFieldStack = ({
  pickup,
  drop,
  onPickupPress,
  onDropPress,
  onSwap,
  pickupIsPlaceholder,
  dropIsPlaceholder,
}: Props) => {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={onPickupPress}
        disabled={!onPickupPress}
      >
        <View style={styles.pickupDot} />
        <View style={styles.textWrap}>
          <Text style={styles.label}>PICKUP</Text>
          <Text
            style={[
              styles.value,
              pickupIsPlaceholder && styles.valuePlaceholder,
            ]}
            numberOfLines={1}
          >
            {pickup}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.connector} />

      <TouchableOpacity
        style={[styles.row, styles.rowBorder]}
        activeOpacity={0.7}
        onPress={onDropPress}
        disabled={!onDropPress}
      >
        <View style={styles.dropDot} />
        <View style={styles.textWrap}>
          <Text style={styles.label}>DROP</Text>
          <Text
            style={[styles.value, dropIsPlaceholder && styles.valuePlaceholder]}
            numberOfLines={1}
          >
            {drop}
          </Text>
        </View>
        {onSwap && (
          <TouchableOpacity
            style={styles.swapBtn}
            activeOpacity={0.75}
            onPress={onSwap}
          >
            <Icon name="swap" size={16} stroke={Colors.ink} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.xl,
    paddingHorizontal: fscale(14),
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(12),
    paddingVertical: fscale(10),
  },
  rowBorder: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderSoft,
  },
  pickupDot: {
    width: fscale(12),
    height: fscale(12),
    borderRadius: fscale(6),
    backgroundColor: Colors.green,
    borderWidth: 3,
    borderColor: '#DCEFE4',
  },
  dropDot: {
    width: fscale(12),
    height: fscale(12),
    borderRadius: fscale(3),
    backgroundColor: Colors.ink,
  },
  connector: {
    position: 'absolute',
    left: fscale(19),
    top: fscale(30),
    bottom: fscale(30),
    width: 1,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(15,17,21,0.18)',
    borderStyle: 'dotted',
  },
  textWrap: { flex: 1, minWidth: 0 },
  label: {
    fontSize: fscale(10.5),
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  value: {
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.ink,
    marginTop: 1,
  },
  valuePlaceholder: {
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  swapBtn: {
    width: fscale(34),
    height: fscale(34),
    borderRadius: Radii.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LocFieldStack;
