import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack, Sheet, TopSafeStrap } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { MapView } from '../../components/map';
import { LocFieldStack, RideCard } from '../../components/ride';
import type { RideOption, RideGlyph } from '../../components/ride';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { getSessionCookie } from '../../utils/auth';
import { decodePolyline } from '../../utils/polyline';
import {
  getRideEstimate,
  isRideApiError,
  type RideEstimateResponse,
  type RideModeEstimate,
} from '../../services/rideApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Ride'>;
type Mode = 'auto' | 'erickshaw';

type LocationPoint = {
  address: string;
  lat: number;
  lng: number;
};

// Backend's ModeCode -> the glyph RideCard already knows how to draw.
// Unrecognised codes fall back to 'auto' rather than crashing the list.
const GLYPH_BY_MODE_CODE: Record<string, RideGlyph> = {
  BIKE: 'bike',
  AUTO: 'auto',
  ERICKSHAW: 'erickshaw',
  CAR: 'sedan',
  SEDAN: 'sedan',
  SUV: 'suv',
};

const glyphForModeCode = (code: string): RideGlyph =>
  GLYPH_BY_MODE_CODE[code?.toUpperCase()] ?? 'auto';

const numOrUndefined = (v: string | undefined): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Maps one live estimate mode straight onto the RideCard's existing
// RideOption shape — nothing in RideCard/RideOption needed to change
// structurally, just the extra optional fields added for real fare/
// discount/availability data.
const modeToRideOption = (m: RideModeEstimate): RideOption => ({
  id: m.ModeCode,
  name: m.ModeName,
  tag: m.CapacityText,
  eta: m.DriverArrivalText,
  fare: numOrUndefined(m.FinalFare) ?? 0,
  max: numOrUndefined(m.Capacity) ?? 0,
  glyph: glyphForModeCode(m.ModeCode),
  originalFare: numOrUndefined(m.OriginalFare),
  discountText: m.DiscountAmountText,
  driversAvailable: numOrUndefined(m.AvailableDrivers),
  available: m.Status === 'AVAILABLE',
});

const RideScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const mode: Mode = route.params?.mode === 'erickshaw' ? 'erickshaw' : 'auto';
  const meta = {
    auto: { ...t.ride.auto, defaultDrop: 'Connaught Place, Delhi' },
    erickshaw: { ...t.ride.erickshaw, defaultDrop: 'Botanical Garden Metro' },
  }[mode];

  // Seeded from whatever HomeScreen's location picker resolved (address +
  // real lat/lng) — falls back to a plain address-only point (no
  // coordinates) if this screen was opened without a prior pick.
  // Coordinates are what unlocks the ride-estimate call below (map
  // markers, route line, live fares — all come from that one response).
  const [pickup, setPickup] = useState<LocationPoint>({
    address: route.params?.pickup || 'Current Location',
    lat: route.params?.pickupLat ?? 0,
    lng: route.params?.pickupLng ?? 0,
  });
  const [drop, setDrop] = useState<LocationPoint>({
    address: route.params?.drop || meta.defaultDrop,
    lat: route.params?.dropLat ?? 0,
    lng: route.params?.dropLng ?? 0,
  });
  const [selected, setSelected] = useState<RideOption | undefined>(undefined);

  const hasPickupCoord = pickup.lat !== 0 && pickup.lng !== 0;
  const hasDropCoord = drop.lat !== 0 && drop.lng !== 0;

  // ── Ride estimate — one call gets pickup/drop confirmation, the route
  // (distance/duration + the exact polyline the fares were priced against),
  // and every available ride mode with live fares. Re-fires whenever the
  // pickup/drop coordinates change (e.g. user edits either field). ────────
  const [estimate, setEstimate] = useState<RideEstimateResponse | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPickupCoord || !hasDropCoord) {
      if (__DEV__) {
        console.log(
          '[RideScreen] Skipping getRideEstimate — missing coordinate(s):',
          { pickup, drop, hasPickupCoord, hasDropCoord },
        );
      }
      setEstimate(null);
      setEstimateError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingEstimate(true);
      setEstimateError(null);
      try {
        const cookie = (await getSessionCookie()) ?? '';
        if (__DEV__) {
          console.log('[RideScreen] Requesting ride estimate:', {
            pickup,
            drop,
            region: 'BEED',
          });
        }
        const result = await getRideEstimate({
          cookie,
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          pickupAddress: pickup.address,
          dropLat: drop.lat,
          dropLng: drop.lng,
          dropAddress: drop.address,
          // TODO: the app supports multiple operating regions (Beed,
          // Chh. Sambhaji Nagar, NCR/Delhi, etc.) — wire real region
          // detection here (e.g. nearest supported city to `pickup`) once
          // that selection logic exists elsewhere in the app. Hardcoded to
          // match your test data for now so this isn't blocked on it.
          region: 'BEED',
        });
        if (cancelled) return;
        if (__DEV__) {
          console.log('[RideScreen] Received ride estimate:', {
            modesCount: result.Modes?.length ?? 0,
            modes: result.Modes?.map(m => m.ModeCode),
            distanceKm: result.Route?.DistanceKM,
          });
        }
        setEstimate(result);
        // Preselect the first AVAILABLE mode (matching this screen's
        // auto/erickshaw entry point when possible) rather than leaving
        // nothing chosen.
        const modes = result.Modes ?? [];
        const preferredCode = mode === 'erickshaw' ? 'ERICKSHAW' : 'AUTO';
        const preferred =
          modes.find(
            m => m.ModeCode === preferredCode && m.Status === 'AVAILABLE',
          ) ??
          modes.find(m => m.Status === 'AVAILABLE') ??
          modes[0];
        setSelected(preferred ? modeToRideOption(preferred) : undefined);
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) {
          console.warn('[RideScreen] getRideEstimate failed:', err);
        }
        setEstimate(null);
        setEstimateError(
          isRideApiError(err) ? err.message : 'Could not fetch ride estimate.',
        );
      } finally {
        if (!cancelled) setLoadingEstimate(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickup.lat,
    pickup.lng,
    drop.lat,
    drop.lng,
    hasPickupCoord,
    hasDropCoord,
  ]);

  const rideOptions: RideOption[] = useMemo(
    () => (estimate?.Modes ?? []).map(modeToRideOption),
    [estimate],
  );

  const routeCoords = useMemo(
    () =>
      estimate?.Route?.EncodedPolyline
        ? decodePolyline(estimate.Route.EncodedPolyline)
        : undefined,
    [estimate?.Route?.EncodedPolyline],
  );

  const handleSwap = () => {
    setPickup(drop);
    setDrop(pickup);
  };

  // Same full-screen map picker HomeScreen uses — hands its result straight
  // back via onPick + goBack() rather than round-tripping through route
  // params.
  const openPicker = (field: 'pickup' | 'drop') => {
    const point = field === 'pickup' ? pickup : drop;
    (navigation.getParent()?.navigate as any)('LocationPicker', {
      field,
      initialLat: point.lat !== 0 ? point.lat : undefined,
      initialLng: point.lng !== 0 ? point.lng : undefined,
      initialAddress: point.address,
      initialSource: point.lat !== 0 ? 'manual' : undefined,
      onPick: (result: {
        address: string;
        lat: number;
        lng: number;
        source: 'gps' | 'manual';
      }) => {
        const newPoint: LocationPoint = {
          address: result.address,
          lat: result.lat,
          lng: result.lng,
        };
        if (field === 'pickup') setPickup(newPoint);
        else setDrop(newPoint);
      },
    });
  };

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <HeaderBack
        title={meta.title}
        sub={meta.sub}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Icon name="filter" size={18} stroke={Colors.ink} />
          </TouchableOpacity>
        }
      />
      <View style={styles.mapArea}>
        <MapView
          height={400}
          style={styles.mapFill}
          // Pickup/drop pill chips removed from above the map — the FROM/TO
          // card below (LocFieldStack) already shows both addresses, so the
          // chips were redundant clutter over the route line.
          showRoute={false}
          showControls={false}
          pickup={pickup.address}
          drop={drop.address}
          pickupCoord={
            hasPickupCoord
              ? { latitude: pickup.lat, longitude: pickup.lng }
              : undefined
          }
          dropCoord={
            hasDropCoord
              ? { latitude: drop.lat, longitude: drop.lng }
              : undefined
          }
          // The exact route the backend priced the fares against — drawn
          // as-is, no separate client-side route calculation.
          externalRouteCoords={routeCoords}
          routeColor={estimate?.Route?.PolylineColor}
          routeWidth={numOrUndefined(estimate?.Route?.PolylineWidth)}
        />
      </View>
      <Sheet style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mode === 'erickshaw' && (
            <View style={styles.ecoBanner}>
              <View style={styles.ecoIconWrap}>
                <Icon name="shield" size={18} stroke={Colors.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ecoTitle}>{t.ride.ecoTitle}</Text>
                <Text style={styles.ecoSub}>{t.ride.ecoSub}</Text>
              </View>
            </View>
          )}
          <LocFieldStack
            pickup={pickup.address}
            drop={drop.address}
            onPickupPress={() => openPicker('pickup')}
            onDropPress={() => openPicker('drop')}
            onSwap={handleSwap}
          />
          <View style={styles.chooseRow}>
            <Text style={styles.chooseLabel}>{t.ride.chooseRide}</Text>
            <Text style={styles.chooseMeta}>
              {estimate?.Route
                ? `${estimate.Route.DistanceKM} km · ${estimate.Route.DurationMinutes} min`
                : loadingEstimate
                ? 'Calculating…'
                : '— km · — min'}
            </Text>
          </View>

          {loadingEstimate && rideOptions.length === 0 && (
            <View style={styles.stateRow}>
              <ActivityIndicator size="small" color={Colors.textTertiary} />
              <Text style={styles.stateText}>Fetching ride options…</Text>
            </View>
          )}

          {!loadingEstimate && estimateError && (
            <View style={styles.stateRow}>
              <Icon name="sos" size={16} stroke={Colors.red} />
              <Text style={styles.stateTextError}>{estimateError}</Text>
            </View>
          )}

          {!loadingEstimate && !estimateError && rideOptions.length === 0 && (
            <View style={styles.stateRow}>
              <Text style={styles.stateText}>
                No ride options available for this route right now.
              </Text>
            </View>
          )}

          <View style={styles.rideList}>
            {rideOptions.map(r => (
              <RideCard
                key={r.id}
                ride={r}
                selected={selected?.id === r.id}
                onSelect={setSelected}
                showStrike
              />
            ))}
          </View>
          <TouchableOpacity style={styles.couponRow} activeOpacity={0.8}>
            <View style={styles.couponIconWrap}>
              <Icon name="coupon" size={16} stroke={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.couponTitle}>{t.ride.applyCoupon}</Text>
              <Text style={styles.couponSub}>{t.ride.couponSub}</Text>
            </View>
            <Icon name="chevron" size={16} stroke={Colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.cashBtn} activeOpacity={0.8}>
              <Icon name="cash" size={18} stroke={Colors.ink} />
              <Text style={styles.cashText}>{t.ride.cash}</Text>
              <Icon
                name="chevronDown"
                size={14}
                stroke={Colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <NCButton
                label={`${t.ride.request} ${selected?.name ?? meta.cta}`}
                iconRight="arrowRight"
                onPress={() => navigation.navigate('Driver')}
                variant="primary"
                size="lg"
                disabled={!selected}
              />
            </View>
          </View>
        </View>
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  filterBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: fscale(20),
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapArea: { height: '38%', overflow: 'hidden' },
  mapFill: { borderRadius: 0, width: '100%', height: '100%' },
  sheet: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.md },
  ecoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    padding: fscale(10),
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0,194,215,0.08)',
    borderRadius: Radii.lg,
  },
  ecoIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    backgroundColor: 'rgba(0,194,215,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ecoTitle: { fontSize: fscale(12.5), fontWeight: '700', color: Colors.ink },
  ecoSub: { fontSize: fscale(11), color: Colors.textSecondary, marginTop: 1 },
  chooseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  chooseLabel: {
    fontSize: fscale(12),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  chooseMeta: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: fscale(10),
  },
  stateText: { fontSize: fscale(12), color: Colors.textSecondary },
  stateTextError: { fontSize: fscale(12), color: '#D64545' },
  rideList: { gap: Spacing.sm },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgOffWhite,
    borderRadius: Radii.lg,
  },
  couponIconWrap: {
    width: fscale(32),
    height: fscale(32),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponTitle: { fontSize: fscale(12.5), fontWeight: '600', color: Colors.ink },
  couponSub: { fontSize: fscale(11), color: Colors.green, marginTop: 1 },
  footer: { backgroundColor: Colors.bgWhite },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  cashBtn: {
    height: fscale(56),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.xl,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cashText: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },
});

export default RideScreen;
