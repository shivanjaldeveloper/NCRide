import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton } from '../../components/common';
import {
  Colors,
  Typography,
  Spacing,
  fscale,
  vscale,
  Radii,
} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPermission'>;

const FEATURES = [
  { icon: '📍', title: 'Precise pickup', sub: 'Saves you time on every ride' },
  { icon: '🗺️', title: 'Live trip tracking', sub: 'Share with friends & family' },
  { icon: '🆘', title: 'SOS in 1 tap', sub: 'Send live location to emergency contacts' },
];

const LocationPermissionScreen = ({ navigation }: Props) => {
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
    // On iOS this is handled by Info.plist NSLocationWhenInUseUsageDescription
    // For production use react-native-permissions for full cross-platform control
    navigation.replace('HomeTabs');
  };

  const handleSkip = () => {
    navigation.replace('HomeTabs');
  };

  return (
    <ScreenShell
      topColor={Colors.bgOffWhite}
      bottomColor={Colors.bgOffWhite}
      backgroundColor={Colors.bgOffWhite}>
      <View style={styles.container}>

        {/* Map illustration */}
        <View style={styles.mapWrap}>
          <View style={styles.mapCard}>
            {/* Road grid */}
            <View style={styles.roadH} />
            <View style={[styles.roadH, { top: '60%' }]} />
            <View style={styles.roadV} />
            <View style={[styles.roadV, { left: '65%' }]} />
            {/* Pin */}
            <View style={styles.pinRipple} />
            <View style={styles.pin}>
              <Text style={styles.pinDot}>📍</Text>
            </View>
          </View>
        </View>

        {/* Copy */}
        <Text style={styles.heading}>Allow precise location</Text>
        <Text style={styles.body}>
          NCRide uses your location to find the closest driver, accurate pickup,
          and live trip tracking. You can change this in Settings.
        </Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map(f => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <NCButton label="Allow precise location" onPress={requestPermission} />
        <View style={styles.gapSm} />
        <NCButton label="Maybe later" onPress={handleSkip} variant="outline" />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingBottom: vscale(32),
  },

  mapWrap: { marginTop: vscale(16), marginBottom: vscale(28) },
  mapCard: {
    height: vscale(200),
    borderRadius: Radii.xl,
    backgroundColor: Colors.mapBlue,
    overflow: 'hidden',
    position: 'relative',
  },
  roadH: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: fscale(14),
    backgroundColor: Colors.mapRoad,
    opacity: 0.7,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '35%',
    width: fscale(14),
    backgroundColor: Colors.mapRoad,
    opacity: 0.7,
  },
  pinRipple: {
    position: 'absolute',
    top: '20%',
    left: '38%',
    width: fscale(60),
    height: fscale(60),
    borderRadius: fscale(30),
    backgroundColor: Colors.blue,
    opacity: 0.18,
  },
  pin: {
    position: 'absolute',
    top: '28%',
    left: '46%',
  },
  pinDot: { fontSize: fscale(24) },

  heading: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: vscale(24),
  },

  featureList: { gap: Spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: { fontSize: fscale(18) },
  featureTitle: { ...Typography.h4, color: Colors.textPrimary },
  featureSub: { ...Typography.caption, color: Colors.textSecondary },

  gapSm: { height: Spacing.sm },
});

export default LocationPermissionScreen;
