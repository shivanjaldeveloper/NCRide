import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import RNMapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
} from 'react-native-maps';
import { openSettings } from 'react-native-permissions';
import { Colors, Radii } from '../../theme';
import Icon from '../common/Icon';
import {
  checkLocationPermission,
  requestLocationPermission,
} from '../../utils/location';
import { getRoute, RouteCoordinate } from '../../utils/routing';

interface Props {
  height?: number;
  showRoute?: boolean;
  showControls?: boolean;
  // When false: disables all map gestures (safe inside a ScrollView)
  interactive?: boolean;
  pickup?: string;
  drop?: string;
  // Real coordinates for pickup/drop — when both are present, a blue
  // road-following route line (and endpoint markers) is drawn on the map.
  pickupCoord?: { latitude: number; longitude: number };
  dropCoord?: { latitude: number; longitude: number };
  // Pre-computed route line — e.g. decoded from the ride-estimate backend's
  // own EncodedPolyline. When provided (2+ points), this is drawn as-is and
  // the internal OSRM route fetch below is skipped entirely, so the line on
  // screen always matches whatever route the backend actually priced.
  externalRouteCoords?: { latitude: number; longitude: number }[];
  routeColor?: string;
  routeWidth?: number;
  animateVehicle?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  // Called every time a meaningfully *better* accuracy fix arrives (not
  // just once) — the very first blue-dot ping from the OS is often a
  // coarse/cached network fix, so callers should keep listening and use
  // the latest call rather than freezing on the first one. `accuracy` is
  // in metres when the platform reports it.
  onLocationUpdate?: (lat: number, lng: number, accuracy?: number) => void;
}

type PermState = 'checking' | 'granted' | 'denied' | 'blocked';

const MapView = ({
  height = 280,
  showRoute = true,
  showControls = true,
  interactive = true,
  pickup = 'Pickup',
  drop = 'Destination',
  pickupCoord,
  dropCoord,
  externalRouteCoords,
  routeColor,
  routeWidth,
  style,
  children,
  onLocationUpdate,
}: Props) => {
  const mapRef = useRef<RNMapView>(null);
  const [permState, setPermState] = useState<PermState>('checking');
  const [hasFirstFix, setHasFirstFix] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [routeCoords, setRouteCoords] = useState<RouteCoordinate[] | null>(
    null,
  );
  const routeRequestIdRef = useRef(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const zoomDeltaRef = useRef({ latitudeDelta: 0.01, longitudeDelta: 0.01 });
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );
  const hasCenteredRef = useRef(false);
  // Tracks the best (lowest) accuracy value seen so far, in metres, so we
  // only ever report an *improvement* upward to the parent instead of
  // flip-flopping between fixes. Starts locked-open; locks once a fix is
  // good enough or the tracking window runs out.
  const bestAccuracyRef = useRef<number>(Number.MAX_SAFE_INTEGER);
  const locationLockedRef = useRef(false);
  const trackingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "Good enough" to stop waiting for a better fix — building-level GPS
  // accuracy. Below this we lock in and stop nudging the parent further.
  const GOOD_ACCURACY_M = 15;
  // How long we keep listening for a better fix before giving up and
  // locking in on whatever the best one seen was (first fix included).
  const TRACKING_WINDOW_MS = 15000;

  useEffect(() => {
    return () => {
      if (trackingTimeoutRef.current) clearTimeout(trackingTimeoutRef.current);
    };
  }, []);

  // ── Route line: fetch a real road-following path once both ends are known,
  // and fit the camera to show the whole route. Falls back to a straight
  // line between the two points if the routing service is unreachable, so
  // there's always a visible connection between pickup and drop. ──────────
  useEffect(() => {
    if (!pickupCoord || !dropCoord) {
      setRouteCoords(null);
      return;
    }

    // A pre-computed route (e.g. from the ride-estimate API) takes
    // priority — skip the OSRM fetch entirely and just draw + fit to it.
    if (externalRouteCoords && externalRouteCoords.length > 1) {
      routeRequestIdRef.current += 1; // invalidate any OSRM fetch in flight
      setRouteCoords(externalRouteCoords);
      requestAnimationFrame(() => {
        mapRef.current?.fitToCoordinates(externalRouteCoords, {
          edgePadding: { top: 60, right: 50, bottom: 60, left: 50 },
          animated: true,
        });
      });
      return;
    }

    const requestId = ++routeRequestIdRef.current;
    (async () => {
      const result = await getRoute(
        { lat: pickupCoord.latitude, lng: pickupCoord.longitude },
        { lat: dropCoord.latitude, lng: dropCoord.longitude },
      );
      if (requestId !== routeRequestIdRef.current) return; // a newer request superseded this one

      const line =
        result && result.coordinates.length > 1
          ? result.coordinates
          : [pickupCoord, dropCoord]; // straight-line fallback
      setRouteCoords(line);

      requestAnimationFrame(() => {
        mapRef.current?.fitToCoordinates(line, {
          edgePadding: { top: 60, right: 50, bottom: 60, left: 50 },
          animated: true,
        });
      });
    })();
  }, [
    pickupCoord?.latitude,
    pickupCoord?.longitude,
    dropCoord?.latitude,
    dropCoord?.longitude,
    externalRouteCoords,
  ]);

  useEffect(() => {
    checkLocationPermission().then(({ granted, blocked }) => {
      if (granted) setPermState('granted');
      else if (blocked) setPermState('blocked');
      else setPermState('denied');
    });
  }, []);

  useEffect(() => {
    if (permState === 'granted' || permState === 'checking') return;
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();
  }, [permState, pulse]);

  const handleEnableLocation = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      const { granted, blocked } = await requestLocationPermission();
      if (granted) setPermState('granted');
      else if (blocked) {
        setPermState('blocked');
        openSettings();
      } else setPermState('denied');
    } finally {
      setRequesting(false);
    }
  };

  const onUserLocationChange = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (!coordinate) return;
    lastCoordRef.current = coordinate;

    if (onLocationUpdate && !locationLockedRef.current) {
      // react-native-maps reports `accuracy` in metres on both platforms
      // when the OS provides it. Treat "unknown" as worst-case so a real
      // reading always wins over it.
      const accuracy: number =
        typeof coordinate.accuracy === 'number'
          ? coordinate.accuracy
          : Number.MAX_SAFE_INTEGER;

      if (accuracy < bestAccuracyRef.current) {
        bestAccuracyRef.current = accuracy;
        onLocationUpdate(coordinate.latitude, coordinate.longitude, accuracy);
      }

      if (accuracy <= GOOD_ACCURACY_M) {
        // Precise enough — stop waiting for anything better.
        locationLockedRef.current = true;
        if (trackingTimeoutRef.current) {
          clearTimeout(trackingTimeoutRef.current);
          trackingTimeoutRef.current = null;
        }
      } else if (!trackingTimeoutRef.current) {
        // First (imprecise) fix — give the GPS chip a window to lock on
        // before we settle for whatever we've got.
        trackingTimeoutRef.current = setTimeout(() => {
          locationLockedRef.current = true;
        }, TRACKING_WINDOW_MS);
      }
    }

    if (hasCenteredRef.current) return;
    hasCenteredRef.current = true;
    setHasFirstFix(true);
    mapRef.current?.animateToRegion(
      {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: zoomDeltaRef.current.latitudeDelta,
        longitudeDelta: zoomDeltaRef.current.longitudeDelta,
      },
      800,
    );
  };

  const zoomBy = (factor: number) => {
    const center = lastCoordRef.current;
    if (!center) return;
    const nextLat = Math.max(
      0.001,
      zoomDeltaRef.current.latitudeDelta * factor,
    );
    const nextLng = Math.max(
      0.001,
      zoomDeltaRef.current.longitudeDelta * factor,
    );
    zoomDeltaRef.current = { latitudeDelta: nextLat, longitudeDelta: nextLng };
    mapRef.current?.animateToRegion(
      {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: nextLat,
        longitudeDelta: nextLng,
      },
      300,
    );
  };

  const recenter = () => {
    const center = lastCoordRef.current;
    if (!center) return;
    mapRef.current?.animateToRegion(
      {
        latitude: center.latitude,
        longitude: center.longitude,
        ...zoomDeltaRef.current,
      },
      500,
    );
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
    <View style={[styles.wrap, height ? { height } : null, style]}>
      {permState === 'granted' ? (
        <>
          <RNMapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            showsUserLocation
            showsMyLocationButton={false}
            followsUserLocation={false}
            onUserLocationChange={onUserLocationChange}
            // Disable all gestures when used as a non-interactive preview
            scrollEnabled={interactive}
            zoomEnabled={interactive}
            rotateEnabled={interactive}
            pitchEnabled={interactive}
          >
            {pickupCoord && (
              <Marker
                coordinate={pickupCoord}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={2}
              >
                <View style={styles.pickupMarker} />
              </Marker>
            )}
            {dropCoord && (
              <Marker
                coordinate={dropCoord}
                anchor={{ x: 0.5, y: 1 }}
                zIndex={2}
              >
                <View style={styles.dropMarker}>
                  <Icon name="pin" size={14} stroke="#fff" sw={2.2} />
                </View>
              </Marker>
            )}
            {routeCoords && routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={routeColor || Colors.blue}
                strokeWidth={routeWidth || 4}
                lineCap="round"
                lineJoin="round"
                zIndex={1}
              />
            )}
          </RNMapView>
          {!hasFirstFix && (
            <View style={[StyleSheet.absoluteFill, styles.fixSpinner]}>
              <ActivityIndicator size="large" color={Colors.blue} />
            </View>
          )}
        </>
      ) : permState === 'checking' ? (
        <View style={[StyleSheet.absoluteFill, styles.fixSpinner]}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, styles.fallback]}
          activeOpacity={0.85}
          onPress={handleEnableLocation}
          disabled={requesting}
        >
          <View style={styles.centerDotWrap}>
            <Animated.View
              style={[
                styles.pulseRing,
                { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
              ]}
            />
            <View style={styles.centerDot} />
          </View>
          <Text style={styles.fallbackText}>
            {permState === 'blocked'
              ? 'Location blocked. Tap to open settings.'
              : 'Tap to enable location'}
          </Text>
        </TouchableOpacity>
      )}

      {showControls &&
        interactive &&
        permState === 'granted' &&
        hasFirstFix && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlBtn}
              activeOpacity={0.8}
              onPress={() => zoomBy(0.5)}
            >
              <Icon name="plus" size={18} stroke={Colors.ink} sw={1.8} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlBtn}
              activeOpacity={0.8}
              onPress={() => zoomBy(2)}
            >
              <Icon name="minus" size={18} stroke={Colors.ink} sw={1.8} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlBtn}
              activeOpacity={0.8}
              onPress={recenter}
            >
              <Icon name="locate" size={18} stroke={Colors.ink} sw={1.8} />
            </TouchableOpacity>
          </View>
        )}

      {showRoute && (
        <View style={styles.chips}>
          <View style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: Colors.green }]} />
            <Text style={styles.chipText} numberOfLines={1}>
              {pickup}
            </Text>
          </View>
          <View style={styles.chip}>
            <View
              style={[
                styles.chipDot,
                styles.chipDotSquare,
                { backgroundColor: Colors.ink },
              ]}
            />
            <Text style={styles.chipText} numberOfLines={1}>
              {drop}
            </Text>
          </View>
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: Colors.map,
    position: 'relative',
  },
  fixSpinner: {
    backgroundColor: Colors.map,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    backgroundColor: Colors.map,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotWrap: { alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(46,125,255,0.35)',
  },
  centerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.blue,
    borderWidth: 5,
    borderColor: '#fff',
  },
  fallbackText: {
    marginTop: 14,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  controls: { position: 'absolute', right: 12, top: 12, gap: 8 },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chips: { position: 'absolute', left: 12, top: 12, gap: 6, maxWidth: '72%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipDotSquare: { borderRadius: 2 },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.ink,
    flexShrink: 1,
  },
  pickupMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.green,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dropMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

export default MapView;
