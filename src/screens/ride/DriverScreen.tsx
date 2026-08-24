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
import { NCButton, Icon, Stars } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { getSessionCookie } from '../../utils/auth';
import { decodePolyline } from '../../utils/polyline';
import {
  getRideStatus,
  isOngoingStatus,
  isTerminalFailureStatus,
} from '../../services/rideApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Driver'>;

// Poll cadence while Status is ACCEPTED, waiting for the trip to start
// (Status flips to ONGOING once the driver enters the OTP) — same cadence
// as SearchingScreen.
const POLL_INTERVAL_MS = 4000;

const numOrUndefined = (v: string | undefined): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const initialsOf = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
};

const DriverScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  // Passed from SearchingScreen once GetRideStatus reports a driver
  // attached — real trip context plus whatever driver/OTP data had
  // already arrived by that first poll. This screen keeps polling below
  // and refreshes driver/OTP as soon as it's present, and hands the same
  // (fresher) shape off to Tracking once Status is ONGOING.
  const {
    rideTran,
    vehicleType,
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
    startOtp: initialOtp,
    driverName: initialDriverName,
    driverMobile: initialDriverMobile,
    vehicleModel: initialVehicleModel,
    vehicleNumber: initialVehicleNumber,
  } = route.params ?? {};

  const [eta, setEta] = useState(180);
  const [driver, setDriver] = useState({
    otp: initialOtp,
    name: initialDriverName,
    mobile: initialDriverMobile,
    vehicleModel: initialVehicleModel,
    vehicleNumber: initialVehicleNumber,
  });

  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spin]);

  // Poll GetRideStatus while the driver is on the way — picks up
  // StartOTP/Driver as soon as the backend has them (in case the handoff
  // from SearchingScreen happened before they were populated), and hands
  // off to Tracking the moment Status flips to ONGOING.
  useEffect(() => {
    if (!rideTran) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const cookie = (await getSessionCookie()) ?? '';
        if (__DEV__) {
          console.log('[DriverScreen] Polling GetRideStatus:', { rideTran });
        }
        const result = await getRideStatus({ cookie, rideTran });
        if (cancelled) return;

        if (__DEV__) {
          console.log('[DriverScreen] Status:', result.Status);
        }

        if (isTerminalFailureStatus(result.Status)) {
          // Driver-side cancellation mid-wait — nothing more to show here.
          navigation.navigate('HomeTabs');
          return;
        }

        if (isOngoingStatus(result.Status)) {
          navigation.replace('Tracking', {
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
            driverName: result.Driver?.Name || driver.name,
            vehicleModel: result.Driver?.VehicleModel || driver.vehicleModel,
            vehicleNumber: result.Driver?.VehicleNumber || driver.vehicleNumber,
          });
          return;
        }

        // Still ACCEPTED (driver on the way) — refresh OTP/driver details
        // as they arrive and keep polling.
        setDriver(prev => ({
          otp: result.StartOTP || prev.otp,
          name: result.Driver?.Name || prev.name,
          mobile: result.Driver?.Mobile || prev.mobile,
          vehicleModel: result.Driver?.VehicleModel || prev.vehicleModel,
          vehicleNumber: result.Driver?.VehicleNumber || prev.vehicleNumber,
        }));
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) {
          console.warn('[DriverScreen] getRideStatus failed:', err);
        }
        // Transient network hiccup — retry on the same cadence.
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

  const min = Math.floor(eta / 60);
  const sec = eta % 60;
  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const routeCoords = routePolyline ? decodePolyline(routePolyline) : undefined;
  const otpDigits = driver.otp ? driver.otp.split('').join(' ') : null;

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <HeaderBack
        title={t.driver.title}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            style={styles.sosBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SOS')}
          >
            <Icon name="sos" size={14} stroke="#fff" sw={2} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.mapArea}>
        <MapView
          style={styles.mapFill}
          showRoute
          showControls={false}
          pickup={pickup || 'Sector 62, Noida'}
          drop={drop || 'Connaught Place'}
          pickupCoord={
            pickupLat && pickupLng
              ? { latitude: pickupLat, longitude: pickupLng }
              : undefined
          }
          dropCoord={
            dropLat && dropLng
              ? { latitude: dropLat, longitude: dropLng }
              : undefined
          }
          externalRouteCoords={routeCoords}
          externalRouteOnly={!!routePolyline}
          routeColor={routeColor}
          routeWidth={routeWidth}
        />
      </View>
      <View style={styles.sheetWrap}>
        <Sheet>
          <View style={styles.driverRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {initialsOf(driver.name) || '—'}
              </Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>
                {driver.name || t.driver.title}
              </Text>
              <View style={styles.ratingRow}>
                <Stars value="4.92" />
                <Text style={styles.ratingMeta}>
                  · 2,418 {t.driver.trips} · 6 {t.driver.yrs}
                </Text>
              </View>
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.actionBtnLight}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Chat')}
              >
                <Icon name="chat" size={20} stroke={Colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnDark}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Chat')}
              >
                <Icon name="phone" size={20} stroke={Colors.lime} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.vehicleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleLabel}>
                {(vehicleType || t.driver.vehicleLabel).toUpperCase()}
              </Text>
              <Text style={styles.vehiclePlate}>
                {driver.vehicleNumber || driver.vehicleModel || ''}
              </Text>
            </View>
            {otpDigits && (
              <View style={styles.otpChip}>
                <Text style={styles.otpText}>
                  {t.driver.otpPrefix} {otpDigits}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.arrivingCard}>
            <Animated.View
              style={[styles.spinnerWrap, { transform: [{ rotate: spinDeg }] }]}
            >
              <Icon name="route" size={20} stroke={Colors.lime} sw={2} />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text style={styles.arrivingLabel}>{t.driver.arriving}</Text>
              <Text style={styles.arrivingTime}>
                {min} min {sec.toString().padStart(2, '0')} sec
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={{ flex: 1 }}>
              <NCButton
                label={t.driver.shareTrip}
                icon="link"
                onPress={() => {}}
                variant="glass"
                size="md"
              />
            </View>
            <View style={{ flex: 1 }}>
              <NCButton
                label={t.driver.cancel}
                icon="close"
                onPress={() => navigation.navigate('HomeTabs')}
                variant="ghost"
                size="md"
              />
            </View>
          </View>
        </Sheet>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  mapArea: { flex: 1 },
  mapFill: { flex: 1, width: '100%', borderRadius: 0 },
  sheetWrap: {},
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: fscale(36),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.red,
  },
  sosText: { fontSize: fscale(12), fontWeight: '700', color: '#fff' },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: {
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fscale(18), fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: fscale(18),
    height: fscale(18),
    borderRadius: fscale(9),
    backgroundColor: Colors.green,
    borderWidth: 3,
    borderColor: '#fff',
  },
  driverName: {
    fontSize: fscale(15),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingMeta: { fontSize: fscale(11.5), color: Colors.textSecondary },
  actionBtns: { flexDirection: 'row', gap: Spacing.sm },
  actionBtnLight: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDark: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgOffWhite,
    borderRadius: Radii.lg,
  },
  vehicleLabel: {
    fontSize: fscale(11),
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  vehiclePlate: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  otpChip: {
    paddingHorizontal: fscale(10),
    paddingVertical: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.ink,
  },
  otpText: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  arrivingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xl,
  },
  spinnerWrap: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: fscale(22),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivingLabel: {
    fontSize: fscale(11),
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  arrivingTime: {
    fontSize: fscale(20),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
  },
  bottomRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});

export default DriverScreen;
