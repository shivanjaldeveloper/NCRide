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
import NetInfo from '@react-native-community/netinfo';
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

// how long we'll wait for a real GPS fix before giving up and moving on
// anyway, so the user is never stuck on this screen if GPS is slow/stuck
const LOCATE_TIMEOUT_MS = 15000;
// how long the user gets to actually see the map centered on them
// before we auto-advance to HomeTabs
const POST_CENTER_DELAY_MS = 1400;

const LocationPermissionScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [requesting, setRequesting] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<RNMapView>(null);
  const hasCenteredOnLiveFix = useRef(false);
  const locateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigatedRef = useRef(false);

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

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    });

    return () => {
      unsubscribe();
      if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
    };
  }, []);

  const getPermissionType = () =>
    Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  const checkInitialLocation = async () => {
    try {
      setMapLoading(true);
      const result = await request(getPermissionType());
      setLocationGranted(result === RESULTS.GRANTED);
    } catch {
      setLocationGranted(false);
    } finally {
      setMapLoading(false);
    }
  };

  // single source of truth for leaving this screen, so we never
  // double-navigate from both the timeout and the live-fix paths
  const goHome = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
    navigation.replace('HomeTabs');
  };

  const requestPermission = async () => {
    try {
      setRequesting(true);

      const netState = await NetInfo.fetch();
      const connected =
        netState.isConnected !== false &&
        netState.isInternetReachable !== false;
      setIsConnected(connected);
      if (!connected) {
        // don't even attempt permission/map without network - the map
        // tiles and the location fix both need connectivity
        setRequesting(false);
        return;
      }

      const result = await request(getPermissionType());
      if (result === RESULTS.GRANTED) {
        setLocationGranted(true);
        setAdvancing(true);
        // safety net: if GPS never resolves, don't trap the user here
        locateTimeoutRef.current = setTimeout(() => {
          goHome();
        }, LOCATE_TIMEOUT_MS);
        // intentionally NOT calling goHome() here - we wait for
        // onUserLocationChange to actually center the map first
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
    if (hasCenteredOnLiveFix.current) return;
    const { coordinate } = event.nativeEvent;
    if (coordinate && mapRef.current) {
      hasCenteredOnLiveFix.current = true;
      mapRef.current.animateToRegion(
        {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
      if (advancing) {
        setTimeout(() => {
          goHome();
        }, POST_CENTER_DELAY_MS);
      }
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

          {advancing && (
            <View style={styles.locatingOverlay}>
              <ActivityIndicator size="small" color={Colors.blue} />
              <Text style={styles.locatingText}>
                {t.permission.locating ?? 'Locating you…'}
              </Text>
            </View>
          )}
        </View>

        {!isConnected && (
          <View style={styles.networkBanner}>
            <Text style={styles.networkBannerText}>
              {t.permission.noNetwork ??
                'Turn on mobile data or Wi-Fi to load the map.'}
            </Text>
          </View>
        )}

        <View style={styles.textBlock}>
          <Text style={styles.heading}>{t.permission.heading}</Text>
          <Text style={styles.body}>{t.permission.body}</Text>

          <View style={styles.featureList}>
            {t.permission.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
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
            disabled={!isConnected}
            variant="primary"
            size="lg"
            style={styles.allowBtn}
          />
        ) : (
          <NCButton
            label={t.permission.allowBtn}
            onPress={goHome}
            loading={advancing}
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
  locatingOverlay: {
    position: 'absolute',
    bottom: vscale(10),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(6),
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: fscale(12),
    paddingVertical: fscale(6),
    borderRadius: Radii.lg,
  },
  locatingText: {
    color: '#fff',
    fontSize: fscale(12),
    fontWeight: '600',
  },
  networkBanner: {
    marginTop: vscale(10),
    backgroundColor: '#FFF4E5',
    borderRadius: Radii.md,
    paddingHorizontal: fscale(12),
    paddingVertical: fscale(8),
  },
  networkBannerText: {
    fontSize: fscale(12.5),
    color: '#8A5A00',
    lineHeight: fscale(18),
  },
  textBlock: {
    marginTop: vscale(22),
  },
  heading: {
    fontSize: fscale(26),
    fontWeight: '700',
    letterSpacing: 0,
    color: Colors.ink,
    paddingTop: fscale(6),
    lineHeight: fscale(38),
  },
  body: {
    marginTop: Spacing.sm,
    fontSize: fscale(14),
    color: Colors.textSecondary,
    lineHeight: fscale(22),
    paddingTop: fscale(4),
  },
  featureList: {
    marginTop: vscale(14),
    gap: vscale(10),
  },
  featureRow: {
    flexDirection: 'row',
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
    marginTop: fscale(2),
    flexShrink: 0,
  },
  featureTextWrap: {
    flex: 1,
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
