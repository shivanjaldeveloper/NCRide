import React, { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Optional: only import if react-native-navigation-bar-color is installed.
// Gracefully skipped if not present.
let changeNavigationBarColor: ((color: string, dark: boolean, anim: boolean) => Promise<void>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  changeNavigationBarColor = require('react-native-navigation-bar-color').default;
} catch {
  // Not installed — Android nav bar color won't be changed
}

interface ScheduledTask {
  cancel: () => void;
}

interface IdleScheduler {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
}

interface Props {
  backgroundColor?: string;
  darkIcons?: boolean;
  opacity?: number;
}

const scheduleIdleTask = (callback: () => void): ScheduledTask => {
  const scheduler = globalThis as typeof globalThis & IdleScheduler;

  if (
    typeof scheduler.requestIdleCallback === 'function' &&
    typeof scheduler.cancelIdleCallback === 'function'
  ) {
    const handle = scheduler.requestIdleCallback(callback);
    return { cancel: () => scheduler.cancelIdleCallback?.(handle) };
  }

  const handle = setTimeout(callback, 0);
  return { cancel: () => clearTimeout(handle) };
};

/**
 * BottomSafeStrap
 * Fills the bottom safe-area inset with a solid colour so the nav bar
 * background always matches the screen. Also changes Android navigation bar
 * colour on focus (requires react-native-navigation-bar-color; degrades
 * gracefully without it).
 */
export const BottomSafeStrap = ({
  backgroundColor = '#F5F5F5',
  darkIcons = true,
  opacity = 1,
}: Props) => {
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !changeNavigationBarColor) {
        return undefined;
      }

      let isActive = true;

      const task = scheduleIdleTask(() => {
        if (!isActive) return;

        const colorToSet =
          backgroundColor === 'transparent' ? '#00000000' : backgroundColor;

        try {
          Promise.resolve(
            changeNavigationBarColor!(colorToSet, darkIcons, false),
          ).catch(err => console.log('Nav bar change failed:', err));
        } catch (err) {
          console.log('Nav bar change failed:', err);
        }
      });

      return () => {
        isActive = false;
        task.cancel();
      };
    }, [backgroundColor, darkIcons]),
  );

  if (insets.bottom === 0 || backgroundColor === 'transparent') {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.strap,
        { height: insets.bottom, backgroundColor, opacity },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  strap: {
    width: '100%',
    flexShrink: 0,
  },
});

export default BottomSafeStrap;
