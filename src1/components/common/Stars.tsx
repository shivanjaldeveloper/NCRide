import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, fscale } from '../../theme';
import Icon from './Icon';

interface Props {
  value: number | string;
  size?: number;
}

/**
 * Stars
 * Small filled-star + numeric rating chip (driver rating, review score).
 * RN port of the reference `Stars`.
 */
const Stars = ({ value, size = 12 }: Props) => {
  return (
    <View style={styles.row}>
      <Icon name="starFill" size={size} stroke={Colors.amber} />
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(3),
  },
  value: {
    fontSize: fscale(12),
    fontWeight: '600',
    color: Colors.ink,
  },
});

export default Stars;
