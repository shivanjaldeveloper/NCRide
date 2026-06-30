import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import RNMapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPermission'>;

const FEATURE_ICONS: IconName[] = ['locate', 'route', 'shield'];

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LocationPermissionScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [requesting, setRequesting] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<RNMapView>(null);

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

  useEffect(() => {
    checkInitialLocation();
  }, []);

  // silent check on mount so the real map can render immediately if
  // permission was already granted in a previous session
  const checkInitialLocation = async () => {
    try {
      setMapLoading(true);
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      const result = await request(permission);
      setLocationGranted(result === RESULTS.GRANTED);
    } catch {
      setLocationGranted(false);
    } finally {
      setMapLoading(false);
    }
  };

  const goHome = () => navigation.replace('HomeTabs');

  const requestPermission = async () => {
    try {
      setRequesting(true);
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        setLocationGranted(true);
        goHome();
      } else if (result === RESULTS.BLOCKED) {
        openSettings();
      }
    } catch {
      goHome();
    } finally {
      setRequesting(false);
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

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <ScreenShell
      topColor={Colors.bgWhite}
      bottomColor={Colors.bgWhite}
      backgroundColor={Colors.bgWhite}
    >
      <View style={styles.container}>
        <View style={styles.mapWrap}>
          {mapLoading ? (
            <View style={styles.mapFallback}>
              <ActivityIndicator size="large" color={Colors.blue} />
            </View>
          ) : locationGranted ? (
            <RNMapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={DEFAULT_REGION}
              showsUserLocation
              showsMyLocationButton={false}
              followsUserLocation
              onUserLocationChange={onUserLocationChange}
            />
          ) : (
            <View style={styles.mapFallback}>
              <View style={styles.centerDotWrap}>
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      opacity: pulseOpacity,
                      transform: [{ scale: pulseScale }],
                    },
                  ]}
                />
                <View style={styles.centerDot} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.textBlock}>
          {/* paddingTop lets matras on the heading render without clipping */}
          <Text style={styles.heading}>{t.permission.heading}</Text>
          <Text style={styles.body}>{t.permission.body}</Text>

          <View style={styles.featureList}>
            {t.permission.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                {/* flex-start so icon stays at top when text wraps in Hindi/Marathi */}
                <View style={styles.featureIconWrap}>
                  <Icon name={FEATURE_ICONS[i]} size={18} stroke={Colors.ink} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {!locationGranted ? (
          <NCButton
            label={t.permission.allowBtn}
            onPress={requestPermission}
            loading={requesting}
            variant="primary"
            size="lg"
            style={styles.allowBtn}
          />
        ) : (
          <NCButton
            label={t.permission.allowBtn}
            onPress={goHome}
            variant="primary"
            size="lg"
            style={styles.allowBtn}
          />
        )}
        <NCButton
          label={t.permission.laterBtn}
          onPress={goHome}
          variant="ghost"
          size="lg"
        />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: vscale(12),
    paddingBottom: vscale(36),
  },
  mapWrap: {
    height: fscale(300),
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: Colors.borderSoft,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotWrap: {
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
    marginTop: vscale(22),
  },
  heading: {
    fontSize: fscale(26),
    fontWeight: '700',
    letterSpacing: 0,
    color: Colors.ink,
    // paddingTop so top matras (ि ्) aren't clipped
    paddingTop: fscale(6),
    // 1.45× lineHeight for Devanagari
    lineHeight: fscale(38),
  },
  body: {
    marginTop: Spacing.sm,
    fontSize: fscale(14),
    color: Colors.textSecondary,
    // 1.6× lineHeight for multi-line Devanagari
    lineHeight: fscale(22),
    paddingTop: fscale(4),
  },
  featureList: {
    marginTop: vscale(14),
    gap: vscale(10),
  },
  featureRow: {
    flexDirection: 'row',
    // flex-start: icon stays at top, text wraps freely below
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  featureIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    backgroundColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    // keeps icon vertically centred relative to first text line
    marginTop: fscale(2),
    flexShrink: 0,
  },
  featureTextWrap: {
    flex: 1,
    // paddingTop so top matras on feature titles aren't cut
    paddingTop: fscale(2),
  },
  featureTitle: {
    fontSize: fscale(13.5),
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: fscale(20),
  },
  featureSub: {
    fontSize: fscale(12),
    color: Colors.textSecondary,
    lineHeight: fscale(18),
    marginTop: fscale(2),
  },
  allowBtn: {
    marginBottom: Spacing.sm,
  },
});

export default LocationPermissionScreen;
