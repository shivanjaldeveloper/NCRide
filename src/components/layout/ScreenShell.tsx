import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { TopSafeStrap } from './TopSafeStrap';
import { BottomSafeStrap } from './BottomSafeStrap';
import { Colors } from '../../theme';

interface Props {
  children: React.ReactNode;
  topColor?: string;
  bottomColor?: string;
  topBarStyle?: 'light-content' | 'dark-content';
  bottomDarkIcons?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
}

/**
 * ScreenShell
 * Drop-in wrapper for every screen. Handles:
 *   - Status bar colour / icon style  (TopSafeStrap)
 *   - Bottom inset fill               (BottomSafeStrap)
 *   - Android nav-bar tint            (BottomSafeStrap)
 *   - Full-screen background colour
 *
 * Usage:
 *   <ScreenShell topColor="#fff" bottomColor="#fff" topBarStyle="dark-content">
 *     {children}
 *   </ScreenShell>
 */
const ScreenShell = ({
  children,
  topColor = Colors.bgOffWhite,
  bottomColor = Colors.bgOffWhite,
  topBarStyle = 'dark-content',
  bottomDarkIcons = true,
  backgroundColor = Colors.bgOffWhite,
  style,
}: Props) => {
  return (
    <View style={[styles.root, { backgroundColor }, style]}>
      <TopSafeStrap backgroundColor={topColor} barStyle={topBarStyle} />
      <View style={styles.body}>{children}</View>
      <BottomSafeStrap backgroundColor={bottomColor} darkIcons={bottomDarkIcons} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});

export default ScreenShell;
