import React from 'react';
import { View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content';
}

/**
 * TopSafeStrap
 * Fills the status-bar area with a solid colour and sets the StatusBar style.
 * Pass backgroundColor="transparent" to let content slide behind the status bar
 * (height becomes 0 so nothing blocks it).
 */
export const TopSafeStrap = ({
  backgroundColor = '#F5F5F5',
  barStyle = 'dark-content',
}: Props) => {
  const insets = useSafeAreaInsets();

  const height = backgroundColor === 'transparent' ? 0 : insets.top;

  return (
    <View style={{ height, backgroundColor }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={barStyle}
      />
    </View>
  );
};

export default TopSafeStrap;
