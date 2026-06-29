import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Radii } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  pad?: number;
  blur?: boolean; // glass-morphism look (frosted card over imagery)
  onPress?: () => void;
}

/**
 * NCCard
 * Matches the design reference's `Card` primitive: white (or frosted) surface,
 * soft shadow, hairline border, large radius.
 *
 * Note: RN has no real `backdrop-filter`. When `blur` is true we approximate
 * the frosted look with a translucent white fill — wrap in a BlurView from
 * `@react-native-community/blur` upstream if a true blur is required.
 */
const NCCard = ({ children, style, pad = 16, blur = false, onPress }: Props) => {
  const content = (
    <View
      style={[
        styles.base,
        { padding: pad },
        blur ? styles.blur : styles.solid,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.xxl, // 28 in reference (≈ T.xxl scaled)
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  solid: {
    backgroundColor: Colors.bgWhite,
  },
  blur: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

export default NCCard;
