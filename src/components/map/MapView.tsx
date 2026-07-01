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
import RNMapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { openSettings } from 'react-native-permissions';
import { Colors, Radii } from '../../theme';
import Icon from '../common/Icon';
import {
  checkLocationPermission,
  requestLocationPermission,
  type LocationStatus,
} from '../../utils/location';

interface Props {
  height?: number;
  showRoute?: boolean;
  showControls?: boolean;
  pickup?: string;
  drop?: string;
  animateVehicle?: boolean; // kept for API compatibility, no-op
  style?: ViewStyle;
  children?: React.ReactNode;
}

type PermState = 'checking' | 'granted' | 'denied' | 'blocked';

const MapView = ({
  height = 280,
  showRoute = true,
  showControls = true,
  pickup = 'Pickup',
  drop = 'Destination',
  style,
  children,
}: Props) => {
  const mapRef = useRef<RNMapView>(null);
  const [permState, setPermState] = useState<PermState>('checking');
  const [hasFirstFix, setHasFirstFix] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const zoomDeltaRef = useRef({ latitudeDelta: 0.01, longitudeDelta: 0.01 });
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    checkLocationPermission().then(({ granted, blocked }) => {
      if (granted) setPermState('granted');
      else if (blocked) setPermState('blocked');
      else setPermState('denied');
    });
  }, []);

  // Pulse animation for the "not granted" fallback state
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
      if (granted) {
        setPermState('granted');
      } else if (blocked) {
        setPermState('blocked');
        openSettings();
      } else {
        setPermState('denied');
      }
    } finally {
      setRequesting(false);
    }
  };

  // Fired by the map's native location layer — no extra library.
  // Centers camera on the real user coordinate on first fix only.
  const onUserLocationChange = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (!coordinate) return;
    lastCoordRef.current = coordinate;
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
    if (!center) return; // no fix yet, nothing to zoom
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
        latitudeDelta: zoomDeltaRef.current.latitudeDelta,
        longitudeDelta: zoomDeltaRef.current.longitudeDelta,
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
          {/* No initialRegion — never shows fake coordinates.
              The map renders at world zoom and immediately snaps to the user
              when onUserLocationChange fires for the first time. */}
          <RNMapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            showsUserLocation
            showsMyLocationButton={false}
            followsUserLocation={false}
            onUserLocationChange={onUserLocationChange}
          />
          {/* Spinner covers the map until we have a real GPS fix */}
          {!hasFirstFix && (
            <View style={[StyleSheet.absoluteFill, styles.fixSpinner]}>
              <ActivityIndicator size="large" color={Colors.blue} />
            </View>
          )}
        </>
      ) : permState === 'checking' ? (
        // Brief checking state on mount
        <View style={[StyleSheet.absoluteFill, styles.fixSpinner]}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : (
        // Denied or blocked — tappable fallback with pulse dot
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

      {/* Zoom + recenter controls — only when map is live and we have a fix */}
      {showControls && permState === 'granted' && hasFirstFix && (
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

      {/* Pickup / drop label chips */}
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
  controls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
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
  chips: {
    position: 'absolute',
    left: 12,
    top: 12,
    gap: 6,
    maxWidth: '72%',
  },
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
});

export default MapView;
