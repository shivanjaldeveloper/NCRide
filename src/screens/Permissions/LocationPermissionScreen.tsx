import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

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
  {
    icon: '📍',
    title: 'Precise pickup',
    sub: 'Saves you time on every ride',
  },
  {
    icon: '🗺️',
    title: 'Live trip tracking',
    sub: 'Share with friends & family',
  },
  {
    icon: '🆘',
    title: 'SOS in 1 tap',
    sub: 'Send live location to emergency contacts',
  },
];

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LocationPermissionScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      setLoading(true);

      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        setLocationGranted(true);
        setLoading(false);
      } else if (result === RESULTS.BLOCKED) {
        setLoading(false);
        setLocationGranted(false);
        openSettings();
      } else {
        setLoading(false);
        setLocationGranted(false);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const onUserLocationChange = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (coordinate && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  };

  return (
    <ScreenShell
      topColor={Colors.bgOffWhite}
      bottomColor={Colors.bgOffWhite}
      backgroundColor={Colors.bgOffWhite}
    >
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.statusText}>Fetching your location...</Text>
            </View>
          ) : !locationGranted ? (
            <View style={styles.center}>
              <Text style={styles.bigEmoji}>📍</Text>
              <Text style={styles.successTitle}>
                Location Permission Required
              </Text>
              <Text style={styles.coord}>
                Enable location access to continue.
              </Text>
            </View>
          ) : (
            <View style={styles.mapWrapper}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                showsUserLocation={true}
                showsMyLocationButton={false}
                followsUserLocation={true}
                onUserLocationChange={onUserLocationChange}
              />
            </View>
          )}
        </View>

        <Text style={styles.heading}>Allow precise location</Text>

        <Text style={styles.body}>
          NCRide uses your location to find nearby drivers, accurate pickup
          points, and live trip tracking.
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map(item => (
            <View key={item.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSub}>{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {!locationGranted ? (
          <NCButton label="Enable Location" onPress={requestLocation} />
        ) : (
          <NCButton
            label="Continue"
            onPress={() => navigation.replace('HomeTabs')}
          />
        )}
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
  mapContainer: {
    height: vscale(260),
    marginTop: vscale(16),
    marginBottom: vscale(24),
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: '#F4F4F4',
  },
  mapWrapper: {
    flex: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 12,
    ...Typography.body,
    color: Colors.textSecondary,
  },
  bigEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  successTitle: {
    ...Typography.h3,
    textAlign: 'center',
  },
  coord: {
    marginTop: 8,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  heading: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  featureList: {},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: fscale(42),
    height: fscale(42),
    borderRadius: Radii.md,
    backgroundColor: Colors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTitle: {
    ...Typography.h4,
  },
  featureSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});

export default LocationPermissionScreen;
