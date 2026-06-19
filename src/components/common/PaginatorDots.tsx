import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, fscale } from '../../theme';

interface Props {
  total: number;
  current: number;
}

const PaginatorDots = ({ total, current }: Props) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(6),
  },
  dot: {
    height: fscale(6),
    borderRadius: fscale(3),
  },
  dotActive: {
    width: fscale(24),
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: fscale(6),
    backgroundColor: Colors.border,
  },
});

export default PaginatorDots;
