import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, fscale } from '../../theme';
import Icon from './Icon';
import { IconName } from './iconPaths';

interface Props {
  icon: IconName | string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  accent?: string;
  danger?: boolean;
}

/**
 * Row
 * Generic icon + title/subtitle list row with optional trailing element or
 * chevron. Used throughout Account, Settings, Activity, Saved places, etc.
 * RN port of the reference `Row`.
 */
const Row = ({ icon, title, sub, right, onPress, accent, danger }: Props) => {
  const content = (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: accent || Colors.borderSoft }]}>
        <Icon name={icon} size={18} stroke={danger ? Colors.red : Colors.ink} sw={1.7} />
      </View>
      <View style={styles.textWrap}>
        <Text
          style={[styles.title, danger && { color: Colors.red }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {sub ? (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress && <Icon name="chevron" size={18} stroke={Colors.textTertiary} sw={1.6} />)}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: fscale(12),
    paddingHorizontal: fscale(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(14),
  },
  iconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: fscale(12),
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

export default Row;
