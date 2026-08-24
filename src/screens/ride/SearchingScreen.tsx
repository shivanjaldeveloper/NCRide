import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack, Sheet, TopSafeStrap } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { getSessionCookie } from '../../utils/auth';
import { decodePolyline } from '../../utils/polyline';
import {
  getRideStatus,
  isRideApiError,
  isDriverAssignedStatus,
  isSearchingStatus,
} from '../../services/rideApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Searching'>;

// Poll cadence — "Call Every 3-5 Second After Booking Only" per spec.
const POLL_INTERVAL_MS = 4000;

// Same helper as RideScreen.tsx — GetRideStatus's numeric-looking fields
// are strings; mirrored here rather than imported since it's a one-liner
// and the two screens don't otherwise share a module.
const numOrUndefined = (v: string | undefined): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const SearchingScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const {
    rideTran,
    vehicleType,
    vehicleName,
    pickup,
    pickupLat,
    pickupLng,
    drop,
    dropLat,
    dropLng,
    routePolyline,
    routeColor,
    routeWidth,
    fareText,
  } = route.params;

  // 'searching' → still polling, 'failed' → CANCELLED/EXPIRED/etc (terminal,
  // stop polling, show retry), 'handoff' → a driver got attached, about to
  // navigate away (kept as its own state just to freeze the UI for the
  // instant before the navigation actually happens).
  const [phase, setPhase] = useState<'searching' | 'failed' | 'handoff'>(
    'searching',
  );
  const [failMessage, setFailMessage] = useState<string | null>(null);

  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Elapsed-time counter — purely cosmetic ("Searching… 0:07"), doesn't
  // drive any control flow.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (phase !== 'searching') return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const cookie = (await getSessionCookie()) ?? '';
        if (__DEV__) {
          console.log('[SearchingScreen] Polling GetRideStatus:', { rideTran });
        }
        const result = await getRideStatus({ cookie, rideTran });
        if (cancelled) return;

        if (__DEV__) {
          console.log('[SearchingScreen] Status:', result.Status);
        }

        if (isSearchingStatus(result.Status)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        if (isDriverAssignedStatus(result.Status)) {
          setPhase('handoff');
          navigation.replace('Driver', {
            rideTran,
            vehicleType: result.VehicleType || vehicleType,
            pickup: result.Pickup?.Address || pickup,
            pickupLat: numOrUndefined(result.Pickup?.Latitude) ?? pickupLat,
            pickupLng: numOrUndefined(result.Pickup?.Longitude) ?? pickupLng,
            drop: result.Drop?.Address || drop,
            dropLat: numOrUndefined(result.Drop?.Latitude) ?? dropLat,
            dropLng: numOrUndefined(result.Drop?.Longitude) ?? dropLng,
            routePolyline: result.Route?.EncodedPolyline || routePolyline,
            routeColor: result.Route?.PolylineColor || routeColor,
            routeWidth:
              numOrUndefined(result.Route?.PolylineWidth) ?? routeWidth,
            fareText: result.Fare?.FinalFareText || fareText,
            // Only present once Status is ACCEPTED — may not have arrived
            // yet on the very first poll that flips off SEARCHING.
            startOtp: result.StartOTP,
            driverName: result.Driver?.Name,
            driverMobile: result.Driver?.Mobile,
            vehicleModel: result.Driver?.VehicleModel,
            vehicleNumber: result.Driver?.VehicleNumber,
          });
          return;
        }

        // Anything else is treated as a terminal failure (CANCELLED,
        // EXPIRED, NO_DRIVER, ...).
        setPhase('failed');
        setFailMessage(
          result.Status === 'CANCELLED'
            ? t.searching.cancelledSub
            : t.searching.noDriverSub,
        );
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) {
          console.warn('[SearchingScreen] getRideStatus failed:', err);
        }
        // A transient network hiccup shouldn't kill the search — retry on
        // the same cadence rather than immediately failing the ride.
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideTran]);

  const routeCoords = routePolyline ? decodePolyline(routePolyline) : undefined;
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <HeaderBack
        title={phase === 'failed' ? t.searching.failedTitle : t.searching.title}
        onBack={() => navigation.navigate('HomeTabs')}
      />
      <View style={styles.mapArea}>
        <MapView
          style={styles.mapFill}
          showRoute={false}
          showControls={false}
          pickup={pickup}
          drop={drop}
          pickupCoord={{ latitude: pickupLat, longitude: pickupLng }}
          dropCoord={{ latitude: dropLat, longitude: dropLng }}
          externalRouteCoords={routeCoords}
          externalRouteOnly
          routeColor={routeColor}
          routeWidth={routeWidth}
        />
      </View>
      <Sheet>
        {phase === 'failed' ? (
          <View style={styles.failedWrap}>
            <View style={styles.failedIconWrap}>
              <Icon name="close" size={22} stroke={Colors.red} sw={2} />
            </View>
            <Text style={styles.failedTitle}>{t.searching.failedTitle}</Text>
            <Text style={styles.failedSub}>
              {failMessage ?? t.searching.noDriverSub}
            </Text>
            <View style={styles.failedBtns}>
              <View style={{ flex: 1 }}>
                <NCButton
                  label={t.searching.backHome}
                  variant="ghost"
                  size="md"
                  onPress={() => navigation.navigate('HomeTabs')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <NCButton
                  label={t.searching.tryAgain}
                  variant="primary"
                  size="md"
                  onPress={() => navigation.goBack()}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.searchingWrap}>
            <Animated.View
              style={[styles.spinnerWrap, { transform: [{ rotate: spinDeg }] }]}
            >
              <Icon name="search" size={24} stroke={Colors.lime} sw={2} />
            </Animated.View>
            <Text style={styles.searchingTitle}>{t.searching.finding}</Text>
            <Text style={styles.searchingSub}>
              {vehicleName || vehicleType} · {fareText} · {min}:
              {sec.toString().padStart(2, '0')}
            </Text>

            <View style={styles.locRow}>
              <View style={styles.locDotPickup} />
              <Text style={styles.locText} numberOfLines={1}>
                {pickup}
              </Text>
            </View>
            <View style={styles.locConnector} />
            <View style={styles.locRow}>
              <View style={styles.locDotDrop} />
              <Text style={styles.locText} numberOfLines={1}>
                {drop}
              </Text>
            </View>

            <View style={{ marginTop: Spacing.lg, alignSelf: 'stretch' }}>
              <NCButton
                label={t.searching.cancel}
                icon="close"
                variant="ghost"
                size="md"
                onPress={() => navigation.navigate('HomeTabs')}
              />
            </View>
          </View>
        )}
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  mapArea: { flex: 1 },
  mapFill: { flex: 1, width: '100%', borderRadius: 0 },
  searchingWrap: { alignItems: 'center', paddingBottom: Spacing.sm },
  spinnerWrap: {
    width: fscale(64),
    height: fscale(64),
    borderRadius: fscale(32),
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  searchingTitle: {
    fontSize: fscale(16),
    fontWeight: '700',
    color: Colors.ink,
    marginTop: Spacing.md,
  },
  searchingSub: {
    fontSize: fscale(12.5),
    color: Colors.textSecondary,
    marginTop: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    marginTop: Spacing.lg,
  },
  locConnector: {
    width: 1,
    height: fscale(14),
    backgroundColor: Colors.border,
    marginLeft: fscale(4),
  },
  locDotPickup: {
    width: fscale(9),
    height: fscale(9),
    borderRadius: fscale(4.5),
    backgroundColor: Colors.lime,
  },
  locDotDrop: {
    width: fscale(9),
    height: fscale(9),
    borderRadius: 2,
    backgroundColor: Colors.ink,
  },
  locText: {
    flex: 1,
    fontSize: fscale(12.5),
    fontWeight: '500',
    color: Colors.ink,
  },
  failedWrap: { alignItems: 'center', paddingBottom: Spacing.md },
  failedIconWrap: {
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: 'rgba(214,69,69,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  failedTitle: {
    fontSize: fscale(16),
    fontWeight: '700',
    color: Colors.ink,
    marginTop: Spacing.md,
  },
  failedSub: {
    fontSize: fscale(12.5),
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  failedBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
});

export default SearchingScreen;
