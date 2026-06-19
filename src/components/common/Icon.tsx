import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme';
import { ICONS, IconName } from './iconPaths';

interface Props {
  name: IconName | string;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number; // stroke width
  style?: StyleProp<ViewStyle>;
}

/**
 * Icon
 * Renders one of the NCRide line-icon set as an SVG, matching the design
 * reference 1:1 (24x24 viewBox, round caps/joins). Icon names ending in
 * "Fill" render as solid shapes instead of outlines (e.g. `starFill`).
 */
const Icon = ({
  name,
  size = 22,
  stroke = Colors.textPrimary,
  fill = 'none',
  sw = 1.6,
  style,
}: Props) => {
  const d = ICONS[name as IconName];

  if (!d) {
    // Fallback placeholder so a missing icon name never crashes a screen.
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: Colors.border,
            borderRadius: 4,
          },
          style,
        ]}
      />
    );
  }

  const filled = name.endsWith('Fill');

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? stroke : fill}
      stroke={filled ? 'none' : stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <Path d={d} />
    </Svg>
  );
};

export default Icon;
