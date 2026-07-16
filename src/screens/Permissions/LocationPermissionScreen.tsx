import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import RNMapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import {
  checkFullLocationStatus,
  requestLocationPermission,
  checkLocationServices,
  promptEnableLocationServices,
  goToLocationSettings,
  type LocationStatus,
} from '../../utils/location';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPermission'>;

const FEATURE_ICONS: IconName[] = ['locate', 'route', 'shield'];
// How long to wait for a GPS fix before giving up and moving to HomeTabs anyway
const LOCATE_TIMEOUT_MS = 15000;
// How long the user sees their centered location before auto-advancing
const POST_CENTER_DELAY_MS = 1400;

const LocationPermissionScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [requesting, setRequesting] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  // Full status — both permission AND GPS services must be true before we
  // let the user through. Permission alone is not enough.
  const [status, setStatus] = useState<LocationStatus | null>(null);
  const [hasFirstFix, setHasFirstFix] = useState(false); // true after first real GPS coord
  const [isConnected, setIsConnected] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<RNMapView>(null);
  const hasCenteredRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const readyForMap = !!status?.permissionGranted && !!status?.servicesEnabled;
  const advancingRef = useRef(false); // ref copy avoids stale closure in callback
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

    // If the user backgrounds the app to flip a system toggle (e.g. GPS from
    // quick settings, or grants permission from Settings) and comes back,
    // re-check automatically instead of leaving them stuck on a stale state.
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        setTimeout(checkInitialLocation, 400);
      }
      appStateRef.current = nextState;
    });

    return () => {
      unsubscribe();
      appStateSub.remove();
      if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
    };
  }, []);

  // Silent read-only check — never shows an OS dialog by itself.
  // Both permission AND GPS services must be true before we consider this
  // screen "done" — permission alone is not enough to proceed.
  const checkInitialLocation = useCallback(async () => {
    try {
      const s = await checkFullLocationStatus();
      setStatus(s);
    } finally {
      setMapLoading(false);
    }
  }, []);

  // Single exit point — prevents double-navigation from timeout + GPS fix race
  const goHome = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
    navigation.replace('HomeTabs');
  };

  // Starts the "wait for a real GPS fix" sequence once both permission and
  // services are confirmed on.
  const startAdvancing = () => {
    setAdvancing(true);
    advancingRef.current = true;
    // Safety net: if GPS never resolves within 15s, don't trap the user
    locateTimeoutRef.current = setTimeout(goHome, LOCATE_TIMEOUT_MS);
  };

  // The single primary-button handler. It always re-evaluates current
  // status first, then does exactly the ONE next thing needed — asks for
  // permission, or turns on GPS, or opens Settings — never skipping ahead.
  const primaryAction = async () => {
    if (requesting) return;
    try {
      setRequesting(true);

      // Confirm network before proceeding — map tiles need connectivity
      const netState = await NetInfo.fetch();
      const connected =
        netState.isConnected !== false &&
        netState.isInternetReachable !== false;
      setIsConnected(connected);
      if (!connected) return;

      // Step 1 — permission not granted yet
      if (!status?.permissionGranted) {
        if (status?.permBlocked) {
          // OS won't show the native dialog again — only Settings can fix it
          goToLocationSettings();
          return;
        }
        const { granted, blocked } = await requestLocationPermission();
        if (blocked) {
          goToLocationSettings();
          return;
        }
        if (!granted) {
          // Denied (not blocked) — stay here, user can try again
          await checkInitialLocation();
          return;
        }
      }

      // Step 2 — permission is granted, now make sure GPS itself is on
      const servicesOn = await checkLocationServices();
      if (!servicesOn) {
        if (Platform.OS === 'android') {
          await promptEnableLocationServices();
        } else {
          goToLocationSettings();
        }
        await checkInitialLocation();
        return;
      }

      // Both are true — refresh state then wait for a real GPS fix
      await checkInitialLocation();
      startAdvancing();
    } finally {
      setRequesting(false);
    }
  };

  // Fired by the map's own internal location layer — no geolocation library needed.
  // Only acts on the very first real coordinate, then locks.
  const onUserLocationChange = (event: any) => {
    if (hasCenteredRef.current) return;
    const { coordinate } = event.nativeEvent;
    if (!coordinate) return;
    hasCenteredRef.current = true;
    setHasFirstFix(true);
    mapRef.current?.animateToRegion(
      {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
    // Only auto-navigate if the user triggered this via "Allow" button
    if (advancingRef.current) {
      setTimeout(goHome, POST_CENTER_DELAY_MS);
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
            // Checking permission on mount
            <View style={styles.mapFallback}>
              <ActivityIndicator size="large" color={Colors.blue} />
            </View>
          ) : readyForMap ? (
            // Permission granted — show real map.
            // No initialRegion so we never show fake coordinates.
            // Spinner overlay hides until the first real GPS fix arrives.
            <>
              <RNMapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsUserLocation
                showsMyLocationButton={false}
                followsUserLocation={false}
                onUserLocationChange={onUserLocationChange}
              />
              {!hasFirstFix && (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.blue} />
                </View>
              )}
            </>
          ) : (
            // No permission yet — a soft radial backdrop with a pinFill
            // icon (from the existing icon set) instead of an empty box.
            <View style={styles.mapFallback}>
              <View style={styles.mapBackdrop}>
                <View style={styles.roadH} />
                <View style={styles.roadV} />
              </View>
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
                <View style={styles.pinBadge}>
                  <Icon
                    name="pinFill"
                    size={26}
                    stroke={Colors.blue}
                    fill={Colors.blue}
                  />
                </View>
              </View>
            </View>
          )}

          {advancing && hasFirstFix && (
            <View style={styles.locatingOverlay}>
              <ActivityIndicator size="small" color={Colors.blue} />
              <Text style={styles.locatingText}>
                {t.permission.locating ?? 'Got your location!'}
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
          {status?.permissionGranted && !status?.servicesEnabled ? (
            <>
              <Text style={styles.heading}>{t.permission.servicesHeading}</Text>
              <Text style={styles.body}>{t.permission.servicesBody}</Text>
            </>
          ) : (
            <>
              <Text style={styles.heading}>{t.permission.heading}</Text>
              <Text style={styles.body}>{t.permission.body}</Text>
            </>
          )}

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

        {readyForMap ? (
          // Both permission and GPS are on — let them continue into the app.
          <NCButton
            label={t.permission.allowBtn}
            onPress={goHome}
            loading={advancing}
            variant="primary"
            size="lg"
            style={styles.allowBtn}
          />
        ) : (
          // Either permission or GPS (or both) is still missing — the single
          // button always does the next required step, never skips ahead.
          <NCButton
            label={
              status?.permBlocked
                ? t.permission.openSettingsBtn
                : status?.permissionGranted
                ? t.permission.enableLocationBtn
                : t.permission.allowBtn
            }
            onPress={primaryAction}
            loading={requesting}
            disabled={!isConnected}
            variant="primary"
            size="lg"
            style={styles.allowBtn}
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
    paddingTop: vscale(12),
    paddingBottom: vscale(36),
  },
  mapWrap: {
    height: fscale(300),
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: Colors.borderSoft,
  },
  map: { flex: 1 },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadH: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    height: fscale(10),
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  roadV: {
    position: 'absolute',
    left: '32%',
    top: 0,
    bottom: 0,
    width: fscale(10),
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  centerDotWrap: { alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: fscale(64),
    height: fscale(64),
    borderRadius: fscale(32),
    backgroundColor: 'rgba(46,125,255,0.35)',
  },
  pinBadge: {
    width: fscale(48),
    height: fscale(48),
    borderRadius: fscale(24),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(46,125,255,0.18)',
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
  locatingText: { color: '#fff', fontSize: fscale(12), fontWeight: '600' },
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
  textBlock: { marginTop: vscale(22) },
  heading: {
    fontSize: fscale(26),
    fontWeight: '700',
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
  featureList: { marginTop: vscale(14), gap: vscale(10) },
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
  featureTextWrap: { flex: 1, paddingTop: fscale(2) },
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
  allowBtn: { marginBottom: Spacing.sm },
});

export default LocationPermissionScreen;
