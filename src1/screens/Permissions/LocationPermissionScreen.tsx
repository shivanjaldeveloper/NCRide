import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPermission'>;

// Matches the reference's three feature rows exactly (icon, title, sub).
const FEATURES: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'locate', title: 'Precise pickup', sub: 'Saves you time on every ride' },
  { icon: 'route', title: 'Live trip tracking', sub: 'Share with friends & family' },
  { icon: 'shield', title: 'SOS in 1 tap', sub: 'Send live location to emergency contacts' },
];

const LocationPermissionScreen = ({ navigation }: Props) => {
  const [requesting, setRequesting] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();
  }, [pulse]);

  const goHome = () => navigation.replace('HomeTabs');

  const requestPermission = async () => {
    try {
      setRequesting(true);
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await request(permission);

      if (result === RESULTS.BLOCKED) {
        openSettings();
      }
      // Whether granted, denied, or blocked, the design moves straight to
      // Home — permission state is handled later wherever location is
      // actually used (matches the reference's go('home') on both buttons).
      goHome();
    } catch (e) {
      goHome();
    } finally {
      setRequesting(false);
    }
  };

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <ScreenShell
      topColor={Colors.bgWhite}
      bottomColor={Colors.bgWhite}
      backgroundColor={Colors.bgWhite}
    >
      <View style={styles.container}>
        <View style={styles.mapWrap}>
          <MapView height={fscale(320)} showRoute={false} showControls={false}>
            <View style={styles.centerDotWrap}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
                ]}
              />
              <View style={styles.centerDot} />
            </View>
          </MapView>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.heading}>Allow precise location</Text>
          <Text style={styles.body}>
            NCRide uses your location to find the closest driver, accurate
            pickup, and live trip tracking. You can change this in Settings.
          </Text>

          <View style={styles.featureList}>
            {FEATURES.map(f => (
              <View key={f.title} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Icon name={f.icon} size={18} stroke={Colors.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <NCButton
          label="Allow precise location"
          onPress={requestPermission}
          loading={requesting}
          variant="primary"
          size="lg"
          style={{ marginBottom: Spacing.sm }}
        />
        <NCButton label="Maybe later" onPress={goHome} variant="ghost" size="lg" />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: vscale(16),
    paddingBottom: vscale(40),
  },
  mapWrap: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
  },
  centerDotWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: 'rgba(46,125,255,0.35)',
  },
  centerDot: {
    width: fscale(28),
    height: fscale(28),
    borderRadius: fscale(14),
    backgroundColor: Colors.blue,
    borderWidth: 5,
    borderColor: '#fff',
  },
  textBlock: {
    marginTop: vscale(28),
  },
  heading: {
    fontSize: fscale(28),
    fontWeight: '700',
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: fscale(32.2),
  },
  body: {
    marginTop: Spacing.md,
    fontSize: fscale(14.5),
    color: Colors.textSecondary,
    lineHeight: fscale(21),
  },
  featureList: {
    marginTop: vscale(18),
    gap: vscale(10),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    backgroundColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: fscale(13.5),
    fontWeight: '600',
    color: Colors.ink,
  },
  featureSub: {
    fontSize: fscale(12),
    color: Colors.textSecondary,
  },
});

export default LocationPermissionScreen;
