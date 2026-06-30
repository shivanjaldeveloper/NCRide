import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from 'react-native';
import RNMapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Colors, Radii } from '../../theme';
import Icon from '../common/Icon';

interface Props {
  height?: number;
  showRoute?: boolean;
  showControls?: boolean;
  pickup?: string;
  drop?: string;
  /**
   * Kept for API compatibility with existing call sites. Real-map version
   * has no SVG vehicle marker to animate, so this is a no-op here too.
   */
  animateVehicle?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const getLocationPermissionType = () =>
  Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

/**
 * MapView
 * Real react-native-maps instance showing the user's live location.
 * Same props API as the previous illustrated-SVG version so every existing
 * call site (location permission, ride tracking, location picker, Home)
 * keeps working unchanged.
 *
 * Note: `showRoute` no longer draws a fabricated polyline between pickup
 * and drop, since those are just display strings without real lat/lng -
 * a route line on a real map needs real coordinates. The pickup/drop
 * label chips still render as before.
 */
const MapView = ({
  height = 280,
  showRoute = true,
  showControls = true,
  pickup = 'Sector 62, Noida',
  drop = 'Connaught Place',
  style,
  children,
}: Props) => {
  const mapRef = useRef<RNMapView>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [checked, setChecked] = useState(false);
  // tracks current zoom so the + / - controls can step it without
  // needing a live region-change listener
  const zoomDeltaRef = useRef({
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  });
  const lastKnownCoordRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const hasCenteredOnLiveFix = useRef(false);

  useEffect(() => {
    // read-only check, never prompts - by the time a screen renders this
    // component, permission should already have been requested via the
    // LocationPermission screen earlier in the flow
    check(getLocationPermissionType())
      .then(result => setLocationGranted(result === RESULTS.GRANTED))
      .catch(() => setLocationGranted(false))
      .finally(() => setChecked(true));
  }, []);

  const onUserLocationChange = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (!coordinate) return;
    lastKnownCoordRef.current = coordinate;
    if (hasCenteredOnLiveFix.current) return;
    hasCenteredOnLiveFix.current = true;
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
    const center = lastKnownCoordRef.current ?? DEFAULT_REGION;
    const nextLatDelta = Math.max(
      0.001,
      zoomDeltaRef.current.latitudeDelta * factor,
    );
    const nextLngDelta = Math.max(
      0.001,
      zoomDeltaRef.current.longitudeDelta * factor,
    );
    zoomDeltaRef.current = {
      latitudeDelta: nextLatDelta,
      longitudeDelta: nextLngDelta,
    };
    mapRef.current?.animateToRegion(
      {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: nextLatDelta,
        longitudeDelta: nextLngDelta,
      },
      300,
    );
  };

  const recenter = () => {
    const center = lastKnownCoordRef.current;
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

  return (
    <View style={[styles.wrap, height ? { height } : null, style]}>
      {checked && locationGranted ? (
        <RNMapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          followsUserLocation={false}
          onUserLocationChange={onUserLocationChange}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}

      {/* floating zoom/locate controls */}
      {showControls && (
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

      {/* pickup/drop label chips */}
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
  fallback: {
    backgroundColor: Colors.map,
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
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipDotSquare: {
    borderRadius: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.ink,
    flexShrink: 1,
  },
});

export default MapView;
