import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing, fscale } from '../../theme';
import Icon from './Icon';
import { IconName } from './iconPaths';

interface Props {
  icon: IconName | string;
  label: string;
  tag?: string;
  color?: string;
  onPress?: () => void;
}

/**
 * ServiceTile
 * The square ride-service picker tile used on Home ("Car", "Bike", "Auto", ...).
 * RN port of the reference `ServiceTile`.
 */
const ServiceTile = ({ icon, label, tag, color, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tile}
    >
      <View style={[styles.iconWrap, { backgroundColor: color || Colors.bgLight }]}>
        <Icon name={icon} size={20} stroke={Colors.ink} sw={1.7} />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        {tag ? <Text style={styles.tag}>{tag}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radii.xl,
    paddingVertical: fscale(14),
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-start',
    gap: Spacing.sm,
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  iconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fscale(13),
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  tag: {
    fontSize: fscale(10.5),
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default ServiceTile;
