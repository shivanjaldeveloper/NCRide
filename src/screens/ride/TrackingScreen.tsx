import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  isCompletedStatus,
  isTerminalFailureStatus,
} from '../../services/rideApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Tracking'>;

// Poll cadence while the trip is ONGOING, waiting for the driver to mark
// it COMPLETED — same cadence as Searching/Driver.
const POLL_INTERVAL_MS = 4000;

const initialsOf = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
};

const TrackingScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const {
    rideTran,
    pickup,
    pickupLat,
    pickupLng,
    drop,
    dropLat,
    dropLng,
    routePolyline,
    routeColor,
    routeWidth,
    driverName,
    vehicleModel,
    vehicleNumber,
  } = route.params ?? {};

  // Cosmetic "which leg of the trip" indicator — the API doesn't return a
  // sub-status while ONGOING, so this still advances on a timer, but the
  // screen itself now only ever moves off ONGOING when GetRideStatus
  // actually reports COMPLETED (see the poll effect below), not on a
  // fixed timer.
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep(s => Math.min(3, s + 1)), 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!rideTran) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const cookie = (await getSessionCookie()) ?? '';
        if (__DEV__) {
          console.log('[TrackingScreen] Polling GetRideStatus:', { rideTran });
        }
        const result = await getRideStatus({ cookie, rideTran });
        if (cancelled) return;

        if (__DEV__) {
          console.log('[TrackingScreen] Status:', result.Status);
        }

        if (isTerminalFailureStatus(result.Status)) {
          navigation.navigate('HomeTabs');
          return;
        }

        if (isCompletedStatus(result.Status)) {
          navigation.replace('Completed', {
            distanceKm: result.Route?.DistanceKM,
            durationMin: result.Route?.DurationMinutes,
            pickup: result.Pickup?.Address,
            drop: result.Drop?.Address || drop,
            fareText: result.Fare?.FinalFareText,
            driverName: result.Driver?.Name || driverName,
            vehicleModel: result.Driver?.VehicleModel || vehicleModel,
            vehicleNumber: result.Driver?.VehicleNumber || vehicleNumber,
          });
          return;
        }

        // Still ONGOING — keep polling.
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) {
          console.warn('[TrackingScreen] getRideStatus failed:', err);
        }
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

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <HeaderBack
        title={t.tracking.title}
        sub={t.tracking.etaSub}
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
                {initialsOf(driverName) || '—'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>
                {driverName || t.tracking.title}
                {vehicleModel ? ` · ${vehicleModel}` : ''}
              </Text>
              {vehicleNumber ? (
                <Text style={styles.driverMeta}>{vehicleNumber}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Icon name="phone" size={18} stroke={Colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Chat')}
            >
              <Icon name="chat" size={18} stroke={Colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.stepsWrap}>
            {t.tracking.steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <View key={i} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepDot,
                      (done || active) && styles.stepDotActive,
                    ]}
                  >
                    {done && (
                      <Icon name="check" size={14} stroke="#fff" sw={2.4} />
                    )}
                    {active && <View style={styles.stepPulse} />}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      (done || active) && styles.stepTextActive,
                      active && styles.stepTextCurrent,
                    ]}
                  >
                    {s}
                  </Text>
                  {active && (
                    <Text style={styles.stepNow}>{t.tracking.now}</Text>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.bottomRow}>
            <View style={{ flex: 1 }}>
              <NCButton
                label={t.tracking.shareLive}
                icon="link"
                onPress={() => {}}
                variant="glass"
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
    width: fscale(44),
    height: fscale(44),
    borderRadius: fscale(22),
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fscale(14), fontWeight: '700', color: '#fff' },
  driverName: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  driverMeta: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  iconBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsWrap: { marginTop: Spacing.md },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: fscale(6),
  },
  stepDot: {
    width: fscale(22),
    height: fscale(22),
    borderRadius: fscale(11),
    backgroundColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.ink },
  stepPulse: {
    width: fscale(8),
    height: fscale(8),
    borderRadius: fscale(4),
    backgroundColor: Colors.lime,
  },
  stepText: {
    fontSize: fscale(13.5),
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  stepTextActive: { color: Colors.ink },
  stepTextCurrent: { fontWeight: '700' },
  stepNow: {
    marginLeft: 'auto',
    fontSize: fscale(11),
    color: Colors.green,
    fontWeight: '700',
  },
  bottomRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});

export default TrackingScreen;
