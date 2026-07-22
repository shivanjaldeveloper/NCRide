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
// discount/availability/surge data.
const modeToRideOption = (m: RideModeEstimate): RideOption => {
  const surgeActive = m.SurgeApplied === 'YES';
  return {
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
    // Only set when the API actually says surge is active — an inactive/
    // absent surge never shows a badge, never changes the fare color.
    surgeActive,
    surgeText: surgeActive
      ? m.SurgeText || `${m.SurgeMultiplier}x surge`
      : undefined,
  };
};

const RideScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const mode: Mode = route.params?.mode === 'erickshaw' ? 'erickshaw' : 'auto';
  const meta = {
    auto: t.ride.auto,
    erickshaw: t.ride.erickshaw,
  }[mode];

  // Seeded from whatever HomeScreen's location picker resolved (address +
  // real lat/lng) — but ONLY when both were actually provided. Previously
  // this fell back to a fake "Current Location" / demo address (e.g.
  // "Connaught Place, Delhi") even when nothing had really been chosen —
  // misleading, since it looked like a real selection. Now: not chosen ⇒
  // null, and the UI below shows a real "Add pickup/drop location" prompt
  // instead of a fake address. This matters because Home's Services row
  // (Auto/E-Rickshaw tiles) can land here with NEITHER location set yet.
  const seedPoint = (
    lat: number | undefined,
    lng: number | undefined,
    address: string | undefined,
  ): LocationPoint | null =>
    typeof lat === 'number' && typeof lng === 'number'
      ? { address: address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng }
      : null;

  const [pickup, setPickup] = useState<LocationPoint | null>(
    seedPoint(
      route.params?.pickupLat,
      route.params?.pickupLng,
      route.params?.pickup,
    ),
  );
  const [drop, setDrop] = useState<LocationPoint | null>(
    seedPoint(route.params?.dropLat, route.params?.dropLng, route.params?.drop),
  );
  const [selected, setSelected] = useState<RideOption | undefined>(undefined);

  const hasPickupCoord = !!pickup;
  const hasDropCoord = !!drop;
  const bothLocationsChosen = hasPickupCoord && hasDropCoord;

  // ── Ride estimate — one call gets pickup/drop confirmation, the route
  // (distance/duration + the exact polyline the fares were priced against),
  // and every available ride mode with live fares. Re-fires whenever the
  // pickup/drop coordinates change (e.g. user edits either field). ────────
  const [estimate, setEstimate] = useState<RideEstimateResponse | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  // Small explanatory note shown only when the mode this screen was opened
  // for (Auto / E-Rickshaw) turned out to be unavailable on this route, so
  // the person understands why a different card got selected instead.
  const [unavailableNotice, setUnavailableNotice] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!pickup || !drop) {
      if (__DEV__) {
        console.log(
          '[RideScreen] Skipping getRideEstimate — pickup and/or drop not chosen yet:',
          { pickup, drop },
        );
      }
      setEstimate(null);
      setEstimateError(null);
      setUnavailableNotice(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingEstimate(true);
      setEstimateError(null);
      setUnavailableNotice(null);
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
        // Preselect whichever mode this screen was opened for (Auto /
        // E-Rickshaw) — but ONLY if the backend says it's actually
        // AVAILABLE. If it's unavailable (or not offered on this route at
        // all), fall back to the literal first card in the list — not
        // "first available", not any other specific mode — and surface a
        // small note explaining why, instead of silently switching modes.
        const modes = result.Modes ?? [];
        const preferredCode = mode === 'erickshaw' ? 'ERICKSHAW' : 'AUTO';
        const preferredMode = modes.find(m => m.ModeCode === preferredCode);
        const preferredAvailable = preferredMode?.Status === 'AVAILABLE';

        if (preferredAvailable && preferredMode) {
          setSelected(modeToRideOption(preferredMode));
          setUnavailableNotice(null);
        } else {
          setSelected(modes[0] ? modeToRideOption(modes[0]) : undefined);
          setUnavailableNotice(
            preferredMode
              ? `${preferredMode.ModeName} is not available right now — showing other options.`
              : null,
          );
        }
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) {
          console.warn('[RideScreen] getRideEstimate failed:', err);
        }
        setEstimate(null);
        setEstimateError(
          isRideApiError(err) ? err.message : 'Could not fetch ride estimate.',
        );
        setUnavailableNotice(null);
      } finally {
        if (!cancelled) setLoadingEstimate(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng]);

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
    (navigation.navigate as any)('LocationPicker', {
      field,
      initialLat: point?.lat,
      initialLng: point?.lng,
      initialAddress: point?.address,
      initialSource: point ? 'manual' : undefined,
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
          pickup={pickup?.address}
          drop={drop?.address}
          pickupCoord={
            pickup ? { latitude: pickup.lat, longitude: pickup.lng } : undefined
          }
          dropCoord={
            drop ? { latitude: drop.lat, longitude: drop.lng } : undefined
          }
          // The exact route the backend priced the fares against — drawn
          // as-is, no separate client-side route calculation. If the API
          // didn't send a polyline (missing/empty), no line is drawn at
          // all — externalRouteOnly disables MapView's own OSRM fallback.
          externalRouteCoords={routeCoords}
          externalRouteOnly
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
            pickup={pickup?.address ?? 'Add pickup location'}
            drop={drop?.address ?? 'Add drop location'}
            pickupIsPlaceholder={!pickup}
            dropIsPlaceholder={!drop}
            onPickupPress={() => openPicker('pickup')}
            onDropPress={() => openPicker('drop')}
            onSwap={handleSwap}
          />

          {!bothLocationsChosen ? (
            // Landed here (e.g. from Home's Services row — Auto/E-Rickshaw
            // tiles) without a pickup and/or drop already chosen. Nothing
            // to estimate yet — prompt clearly instead of silently showing
            // an empty/misleading ride list.
            <View style={styles.chooseLocationPrompt}>
              <View style={styles.chooseLocationIconWrap}>
                <Icon name="pin" size={18} stroke={Colors.textSecondary} />
              </View>
              <Text style={styles.chooseLocationText}>
                Add pickup & destination to find a ride
              </Text>
            </View>
          ) : (
            <>
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

              {unavailableNotice && (
                <View style={styles.stateRow}>
                  <Icon name="sos" size={14} stroke={Colors.amber} />
                  <Text style={styles.unavailableNoticeText}>
                    {unavailableNotice}
                  </Text>
                </View>
              )}

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

              {!loadingEstimate &&
                !estimateError &&
                rideOptions.length === 0 && (
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
            </>
          )}
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
  unavailableNoticeText: { fontSize: fscale(12), color: Colors.amber, flex: 1 },
  chooseLocationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chooseLocationIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chooseLocationText: {
    flex: 1,
    fontSize: fscale(12.5),
    fontWeight: '500',
    color: Colors.textSecondary,
  },
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
