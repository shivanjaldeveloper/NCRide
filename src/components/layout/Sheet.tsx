import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
}

/**
 * Sheet
 * White rounded-top card anchored to the bottom of the screen with a
 * grabber handle, sliding up on mount. RN port of the reference `Sheet`.
 * Used standalone here (Ride, Driver, Tracking) — for a true draggable
 * sheet, this is a good spot to later swap in @gorhom/bottom-sheet
 * without touching callers.
 */
const Sheet = ({ children, style }: Props) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 60,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        { opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      <View style={styles.grabber} />
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: Colors.bgWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: Spacing.screen,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 12,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15,17,21,0.12)',
    alignSelf: 'center',
    marginBottom: 12,
  },
});

export default Sheet;
