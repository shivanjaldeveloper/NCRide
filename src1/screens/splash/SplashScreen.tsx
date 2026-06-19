import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, fscale, vscale, Spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  const screenOpacity = useRef(new Animated.Value(0)).current;

  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  const glowOpacity = useRef(new Animated.Value(0.05)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),

      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),

      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 800,
        delay: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.16,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.05,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const animateDot = (value: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);

    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Onboarding');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    navigation,
    screenOpacity,
    logoScale,
    logoOpacity,
    textOpacity,
    loaderOpacity,
    glowOpacity,
    floatAnim,
    dot1,
    dot2,
    dot3,
  ]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.View
        style={[
          styles.root,
          {
            opacity: screenOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.splashTop, Colors.splashMid, Colors.splashBot]}
          locations={[0, 0.45, 1]}
          style={styles.gradient}
        >
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [
                  {
                    scale: glowOpacity.interpolate({
                      inputRange: [0.05, 0.16],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoWrap,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { translateY: floatAnim }],
              },
            ]}
          >
            <View style={styles.logoBox}>
              {/* Replace with SVG Logo */}
              <Text style={styles.logoEmoji}>🚌</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
              },
            ]}
          >
            <Text style={styles.brandName}>NCRide</Text>

            <Text style={styles.brandSub}>NOIDA · DELHI NCR RIDES</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomWrap,
              {
                opacity: loaderOpacity,
                bottom: insets.bottom + vscale(28),
              },
            ]}
          >
            <View style={styles.loaderRow}>
              <Animated.View style={[styles.loaderDot, { opacity: dot1 }]} />
              <Animated.View style={[styles.loaderDot, { opacity: dot2 }]} />
              <Animated.View style={[styles.loaderDot, { opacity: dot3 }]} />
            </View>

            <Text style={styles.region}>INDIA · NCR</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.splashBot,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: fscale(240),
    height: fscale(240),
    borderRadius: fscale(120),
    backgroundColor: Colors.accent,
  },

  logoWrap: {
    marginBottom: vscale(22),
  },

  logoBox: {
    width: fscale(96),
    height: fscale(96),
    borderRadius: fscale(28),

    backgroundColor: Colors.accent,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: Colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },

    elevation: 16,
  },

  logoEmoji: {
    fontSize: fscale(42),
  },

  textContainer: {
    alignItems: 'center',
  },

  brandName: {
    ...Typography.h1,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },

  brandSub: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.6,
  },

  bottomWrap: {
    position: 'absolute',
    alignItems: 'center',
  },

  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vscale(12),
  },

  loaderDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accent,
    marginHorizontal: 4,
  },

  region: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
  },
});

export default SplashScreen;
