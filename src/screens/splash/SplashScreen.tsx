import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { Colors, fscale } from '../../theme';
import { getPersistedLocale } from '../../i18n';
import { isLoggedIn } from '../../utils/auth';
import { checkFullLocationStatus } from '../../utils/location';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 2200;
const { width: SW, height: SH } = Dimensions.get('screen');

const SplashScreen = ({ navigation }: Props) => {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
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
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 400,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const timer = setTimeout(async () => {
      try {
        const loggedIn = await isLoggedIn();

        if (loggedIn) {
          // Returning user — check if location is ready
          const locStatus = await checkFullLocationStatus();
          if (locStatus.allGood) {
            navigation.replace('HomeTabs');
          } else {
            // Permission or services not ready — send to permission screen
            navigation.replace('LocationPermission');
          }
        } else {
          // New/logged-out user — start the onboarding flow
          const savedLocale = await getPersistedLocale();
          if (savedLocale) {
            navigation.replace('Onboarding');
          } else {
            navigation.replace('LanguageSelect');
          }
        }
      } catch {
        // Fallback: start fresh
        navigation.replace('LanguageSelect');
      }
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation, logoScale, logoOpacity, textOpacity, loaderOpacity, spin]);

  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Svg
        width={SW}
        height={SH}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="glowLime" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#8EC000" stopOpacity="0.22" />
            <Stop offset="40%" stopColor="#4A7000" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1A4FCC" stopOpacity="0.24" />
            <Stop offset="40%" stopColor="#091A50" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={SW * 0.25}
          cy={SH * 0.28}
          rx={SW * 1.2}
          ry={SH * 0.52}
          fill="url(#glowLime)"
        />
        <Ellipse
          cx={SW * 0.75}
          cy={SH * 0.72}
          rx={SW * 1.2}
          ry={SH * 0.52}
          fill="url(#glowBlue)"
        />
      </Svg>

      <Animated.View
        style={[
          styles.logoBox,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../../assets/images/a.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.brandName}>Alo Alo</Text>
        <Text style={styles.brandSub}>Maharashtra · Beed . Aurangabad</Text>
      </Animated.View>

      <Animated.View style={[styles.bottomWrap, { opacity: loaderOpacity }]}>
        <Animated.View
          style={[styles.spinnerWrap, { transform: [{ rotate: spinDeg }] }]}
        >
          <Svg width={28} height={28} viewBox="0 0 50 50">
            <Circle
              cx={25}
              cy={25}
              r={20}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={3}
              fill="none"
            />
            <Path
              d="M25 5 A20 20 0 0 1 45 25"
              stroke={Colors.lime}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
        <Text style={styles.region}>INDIA · MAHARASHTRA</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: fscale(90), height: fscale(90) },
  logoBox: {
    width: fscale(110),
    height: fscale(110),
    borderRadius: fscale(32),
    backgroundColor: '#E8FBC9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: fscale(28),
    shadowColor: Colors.lime,
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  brandName: {
    fontSize: fscale(34),
    fontWeight: '700',
    letterSpacing: -1.2,
    color: '#FFFFFF',
  },
  brandSub: {
    marginTop: fscale(6),
    fontSize: fscale(13),
    fontWeight: '500',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.55)',
  },
  bottomWrap: {
    position: 'absolute',
    bottom: fscale(60),
    alignItems: 'center',
    gap: fscale(12),
  },
  spinnerWrap: { width: 28, height: 28 },
  region: {
    fontSize: fscale(11),
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
  },
});

export default SplashScreen;
