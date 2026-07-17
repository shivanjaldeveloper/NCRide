import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TopSafeStrap } from '../../components/layout';
import { Icon } from '../../components/common';
import { MapView } from '../../components/map';
import type { IconName } from '../../components/common';
import type {
  HomeTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import {
  Colors,
  Typography,
  Spacing,
  fscale,
  vscale,
  Radii,
  Shadows,
} from '../../theme';
import { useTranslation } from '../../i18n';
import { reverseGeocode } from '../../utils/geocode';
import {
  checkFullLocationStatus,
  type LocationStatus,
} from '../../utils/location';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

type LocationPoint = {
  address: string;
  shortName: string;
  lat: number;
  lng: number;
  // 'gps' = came from device location and is safe to silently refresh;
  // 'manual' = the user deliberately chose this and it must stick.
  source: 'gps' | 'manual';
};

const SERVICE_ICONS: IconName[] = ['taxi', 'car', 'courier'];
const SERVICE_BG = ['#FEF6E4', '#E0FAFD', '#FFE9DC'];
const SERVICE_IDS = ['auto', 'erickshaw', 'courier'];
const QUICK_ACTION_ICONS: IconName[] = ['coupon', 'reward', 'refer'];
const QUICK_ACTION_IDS = ['coupons', 'rewards', 'refer'];

const RECENT_RIDES: {
  id: string;
  icon: IconName;
  from: string;
  to: string;
  fare: string;
  type: string;
}[] = [
  {
    id: '1',
    icon: 'taxi',
    from: 'Sector 62',
    to: 'Connaught Place',
    fare: '₹110',
    type: 'Auto · Yesterday',
  },
  {
    id: '2',
    icon: 'car',
    from: 'Sector 18',
    to: 'Botanical Garden Metro',
    fare: '₹45',
    type: 'E-Rickshaw · 2 days ago',
  },
  {
    id: '3',
    icon: 'taxi',
    from: 'Noida Sector 16',
    to: 'India Gate',
    fare: '₹96',
    type: 'Auto · 5 days ago',
  },
];

const HomeScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [drop, setDrop] = useState<LocationPoint | null>(null);
  // Top pill's own live location — always reflects the device's real-time
  // position, independent of whatever pickup the user has chosen. It also
  // seeds pickup the first time it resolves (see handleLocationUpdate)
  // unless the user has already set/cleared pickup themselves.
  const [liveLocation, setLiveLocation] = useState<{
    shortName: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [liveLocating, setLiveLocating] = useState(true);
  const liveBestAccuracyRef = useRef<number>(Number.MAX_SAFE_INTEGER);
  const liveGeocodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // True the instant the user deliberately sets or clears pickup themselves
  // (via the picker or the ✕ button) — once true, the GPS auto-fill below
  // never touches pickup again, even if it becomes empty.
  const pickupUserSetRef = useRef(false);
  // Permission + GPS-services status, re-checked on mount and whenever the
  // app comes back to the foreground. A ride-hailing home screen can't work
  // without real location, so if either is missing we send the user to the
  // dedicated LocationPermission flow (same screen used on first launch)
  // instead of silently spinning forever.
  const [locationStatus, setLocationStatus] = useState<LocationStatus | null>(
    null,
  );
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ── Live GPS fix from MapView's own blue-dot, refined over time ─────────
  // Drives ONLY the top pill. The very first fix reported here is often a
  // coarse/cached one; we keep getting called as react-native-maps' own
  // location provider improves its accuracy, and only act on genuine
  // improvements. No extra native dependency needed — this uses accuracy
  // data react-native-maps already reports on both platforms.
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number, accuracy?: number) => {
      setLiveLocating(false);
      const acc = accuracy ?? Number.MAX_SAFE_INTEGER;
      if (acc >= liveBestAccuracyRef.current) return; // not actually better than what we have
      liveBestAccuracyRef.current = acc;

      if (liveGeocodeDebounceRef.current)
        clearTimeout(liveGeocodeDebounceRef.current);
      liveGeocodeDebounceRef.current = setTimeout(async () => {
        const place = await reverseGeocode(lat, lng);
        setLiveLocation({ shortName: place.shortName, lat, lng });

        // Standard ride-hailing behaviour (Uber/Ola/Rapido): pre-fill FROM
        // with the device's current location the first time we resolve
        // one. Uses a functional update so it never clobbers a pickup the
        // user already chose, and the ref stops it from ever refilling a
        // pickup the user deliberately cleared.
        if (!pickupUserSetRef.current) {
          setPickup(prev =>
            prev
              ? prev
              : {
                  address: place.address,
                  shortName: place.shortName,
                  lat,
                  lng,
                  source: 'gps',
                },
          );
        }
      }, 400);
    },
    [],
  );

  // Fallback so the pill never spins on "Locating…" forever if GPS/geocoding
  // silently never resolves (weak signal, indoors, etc.) — after a while it
  // drops to "Set location" so the user can still act.
  useEffect(() => {
    const timeout = setTimeout(() => setLiveLocating(false), 12000);
    return () => clearTimeout(timeout);
  }, []);

  // ── Location permission + GPS-services guard ─────────────────────────────
  // Re-checks on mount and every time the app returns to the foreground
  // (permission/GPS can be revoked from system Settings while backgrounded).
  // If either is missing, route to the existing LocationPermission screen —
  // it already owns the full grant flow — rather than letting Home sit with
  // a dead map and a pickup that can never resolve.
  const guardLocationAccess = useCallback(async () => {
    const status = await checkFullLocationStatus();
    setLocationStatus(status);
    if (!status.allGood) {
      navigation.getParent()?.navigate('LocationPermission' as never);
    }
    return status;
  }, [navigation]);

  useEffect(() => {
    guardLocationAccess();
    const sub = AppState.addEventListener('change', next => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === 'active'
      ) {
        guardLocationAccess();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [guardLocationAccess]);

  // ── Navigation ────────────────────────────────────────────────────────────
  // The picker hands its result straight back via onPick + goBack() instead
  // of round-tripping through this screen's route params — passing both a
  // FROM pick and a TO pick through the same params slot in quick
  // succession was the cause of one silently clobbering the other.
  const openPicker = (field: 'pickup' | 'drop') => {
    const point = field === 'pickup' ? pickup : drop;
    // Cast the function itself (not the args) to sidestep a known
    // React Navigation + optional-chaining TS quirk: `getParent()?.navigate`
    // collapses multi-arg overloads to a `[never, never]` tuple, which then
    // rejects any real params object passed to it.
    (navigation.getParent()?.navigate as any)('LocationPicker', {
      field,
      // For a field with nothing set yet, start the map at the device's
      // live location (or near the pickup point for TO) rather than a
      // blank world map — still fully editable via search.
      initialLat:
        point?.lat ??
        (field === 'drop'
          ? pickup?.lat ?? liveLocation?.lat
          : liveLocation?.lat),
      initialLng:
        point?.lng ??
        (field === 'drop'
          ? pickup?.lng ?? liveLocation?.lng
          : liveLocation?.lng),
      initialAddress: point?.address,
      // Always 'manual' when reopening an existing point (even a
      // GPS-auto-filled pickup) — this just means "don't silently
      // reshuffle it while the user is looking at it"; it does not mean
      // pickup can never come from GPS in the first place.
      initialSource: point ? 'manual' : undefined,
      onPick: (result: {
        address: string;
        lat: number;
        lng: number;
        source: 'gps' | 'manual';
      }) => {
        const newPoint: LocationPoint = {
          address: result.address,
          shortName: result.address.split(',')[0].trim(),
          lat: result.lat,
          lng: result.lng,
          source: result.source,
        };
        if (field === 'pickup') {
          pickupUserSetRef.current = true;
          setPickup(newPoint);
        } else setDrop(newPoint);
      },
    });
  };

  const goRide = (mode: 'auto' | 'erickshaw') =>
    (navigation.getParent()?.navigate as any)('Ride', {
      mode,
      pickup: pickup?.address ?? '',
      drop: drop?.address ?? '',
    });

  const goCourier = () => navigation.getParent()?.navigate('Courier' as never);

  const clearPickup = () => {
    pickupUserSetRef.current = true;
    setPickup(null);
  };
  const clearDrop = () => setDrop(null);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgOffWhite }}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AR</Text>
            </View>
            <View>
              <Text style={styles.greeting}>{t.home.greeting}</Text>
              <Text style={styles.headerTitle}>{t.home.headerTitle}</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => navigation.getParent()?.navigate('SOS' as never)}
            >
              <Icon name="sos" size={16} stroke={Colors.red} sw={1.7} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() =>
                navigation.getParent()?.navigate('Notifications' as never)
              }
            >
              <Icon name="bell" size={16} stroke={Colors.ink} sw={1.7} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Location pill ──────────────────────────────────────────────── */}
        {/* Always shows the device's real current location — independent of
            whatever pickup point the user has (or hasn't) chosen below. */}
        <TouchableOpacity
          style={styles.locationPill}
          activeOpacity={0.8}
          onPress={() => {
            if (locationStatus && !locationStatus.allGood) {
              guardLocationAccess();
              return;
            }
            openPicker('pickup');
          }}
        >
          {liveLocating && !liveLocation ? (
            <ActivityIndicator size="small" color={Colors.blue} />
          ) : (
            <Icon name="locate" size={12} stroke={Colors.blue} sw={2.2} />
          )}
          <Text style={styles.locationText} numberOfLines={1}>
            {locationStatus && !locationStatus.allGood
              ? 'Enable location'
              : liveLocation?.shortName ??
                (liveLocating ? 'Locating…' : 'Set location')}
          </Text>
          <Icon
            name="chevronDown"
            size={11}
            stroke={Colors.textSecondary}
            sw={2}
          />
        </TouchableOpacity>

        {/* ── Map preview ────────────────────────────────────────────────── */}
        {/* Non-interactive (scrollEnabled=false prevents gesture conflicts
            with the outer ScrollView). Shows user's real location.
            showRoute is off here — no floating pickup/drop chips on the
            map; that info now lives in the route card below it instead. */}
        <View style={[styles.mapWrap, Shadows.card]}>
          <MapView
            height={vscale(200)}
            showRoute={false}
            showControls={false}
            interactive={false}
            pickup={pickup?.shortName}
            drop={drop?.shortName}
            pickupCoord={
              pickup
                ? { latitude: pickup.lat, longitude: pickup.lng }
                : undefined
            }
            dropCoord={
              drop ? { latitude: drop.lat, longitude: drop.lng } : undefined
            }
            onLocationUpdate={handleLocationUpdate}
          />
        </View>

        {/* ── Route card ─────────────────────────────────────────────────── */}
        {/* Unified FROM / TO interaction — one card, two rows, no confusion. */}
        <View style={[styles.routeCard, Shadows.card]}>
          {/* FROM row — tap to change pickup */}
          <TouchableOpacity
            style={styles.routeRow}
            activeOpacity={0.75}
            onPress={() => openPicker('pickup')}
          >
            <View style={styles.routeDotWrap}>
              <View
                style={[styles.routeDot, { backgroundColor: Colors.green }]}
              />
              <View style={styles.routeLine} />
            </View>
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeFieldLabel}>FROM</Text>
              <Text
                style={[
                  styles.routeFieldValue,
                  !pickup && styles.routeFieldPlaceholder,
                ]}
                numberOfLines={1}
              >
                {pickup?.shortName ?? 'Add pickup location'}
              </Text>
            </View>
            {pickup ? (
              <TouchableOpacity
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={clearPickup}
              >
                <Icon
                  name="close"
                  size={14}
                  stroke={Colors.textSecondary}
                  sw={2}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.searchChip}>
                <Icon
                  name="search"
                  size={12}
                  stroke={Colors.textSecondary}
                  sw={2}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* TO row — tap to set destination */}
          <TouchableOpacity
            style={[styles.routeRow, styles.routeRowLast]}
            activeOpacity={0.75}
            onPress={() => openPicker('drop')}
          >
            <View style={styles.routeDotWrap}>
              <View
                style={[
                  styles.routeDot,
                  styles.routeDotDrop,
                  drop && {
                    backgroundColor: Colors.ink,
                    borderColor: Colors.ink,
                  },
                ]}
              />
            </View>
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeFieldLabel}>TO</Text>
              <Text
                style={[
                  styles.routeFieldValue,
                  !drop && styles.routeFieldPlaceholder,
                ]}
                numberOfLines={1}
              >
                {drop?.shortName ?? 'Where to?'}
              </Text>
            </View>
            {drop ? (
              <TouchableOpacity
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={clearDrop}
              >
                <Icon
                  name="close"
                  size={14}
                  stroke={Colors.textSecondary}
                  sw={2}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.searchChip}>
                <Icon
                  name="search"
                  size={12}
                  stroke={Colors.textSecondary}
                  sw={2}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Book button — only active once BOTH pickup and drop are set ── */}
        {pickup && drop ? (
          <TouchableOpacity
            style={styles.bookBtn}
            activeOpacity={0.85}
            onPress={() => goRide('auto')}
          >
            <Icon name="taxi" size={20} stroke={Colors.lime} sw={1.7} />
            <Text style={styles.bookBtnText}>{t.home.book} Auto</Text>
            <Icon name="arrowRight" size={18} stroke={Colors.lime} sw={2} />
          </TouchableOpacity>
        ) : (
          // Placeholder hint — wording adapts to whichever field is missing
          <View style={styles.bookHint}>
            <Icon
              name="locate"
              size={14}
              stroke={Colors.textTertiary}
              sw={1.5}
            />
            <Text style={styles.bookHintText}>
              {!pickup && !drop
                ? 'Add pickup & destination to find a ride'
                : !pickup
                ? 'Add your pickup location'
                : 'Tap "Where to?" to find a ride'}
            </Text>
          </View>
        )}

        {/* ── Services ───────────────────────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>{t.home.services}</Text>
        </View>
        <View style={styles.servicesGrid}>
          {t.home.serviceItems.map((s, i) => (
            <TouchableOpacity
              key={SERVICE_IDS[i]}
              style={[styles.serviceCard, { backgroundColor: SERVICE_BG[i] }]}
              activeOpacity={0.75}
              onPress={() =>
                SERVICE_IDS[i] === 'courier'
                  ? goCourier()
                  : goRide(
                      SERVICE_IDS[i] === 'erickshaw' ? 'erickshaw' : 'auto',
                    )
              }
            >
              <View style={styles.serviceIconWrap}>
                <Icon
                  name={SERVICE_ICONS[i]}
                  size={24}
                  stroke={Colors.ink}
                  sw={1.8}
                />
              </View>
              <Text style={styles.serviceLabel}>{s.label}</Text>
              <Text style={styles.serviceSub}>{s.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Promo ──────────────────────────────────────────────────────── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoEyebrow}>{t.home.limitedOffer}</Text>
            <Text style={styles.promoTitle}>{t.home.promoTitle}</Text>
            <TouchableOpacity style={styles.promoCodeBtn} activeOpacity={0.85}>
              <Text style={styles.promoCodeText}>{t.home.promoCode}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoGift}>
            <Icon name="gift" size={48} stroke={Colors.ink} sw={1.4} />
          </View>
        </View>

        {/* ── Recent Rides ───────────────────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>{t.home.recentRides}</Text>
        </View>
        <View style={[styles.card, Shadows.card]}>
          {RECENT_RIDES.map((ride, index) => (
            <View key={ride.id}>
              <View style={styles.rideRow}>
                <View style={styles.rideIconWrap}>
                  <Icon
                    name={ride.icon}
                    size={17}
                    stroke={Colors.ink}
                    sw={1.7}
                  />
                </View>
                <View style={styles.rideInfo}>
                  <Text style={styles.rideRoute}>
                    {ride.from} — {ride.to}
                  </Text>
                  <Text style={styles.rideType}>{ride.type}</Text>
                </View>
                <View style={styles.rideFareWrap}>
                  <Text style={styles.rideFare}>{ride.fare}</Text>
                  <Text style={styles.ridePaid}>{t.common.paid}</Text>
                </View>
              </View>
              {index < RECENT_RIDES.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        {/* ── Wallet ─────────────────────────────────────────────────────── */}
        <View style={[styles.walletCard, Shadows.card]}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIconWrap}>
              <Icon name="wallet" size={18} stroke={Colors.lime} sw={1.7} />
            </View>
            <View>
              <Text style={styles.walletLabel}>{t.home.walletLabel}</Text>
              <Text style={styles.walletAmount}>₹ 2,184.50</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addMoneyBtn} activeOpacity={0.8}>
            <Text style={styles.addMoneyText}>{t.home.addMoney}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>{t.home.quickActions}</Text>
        </View>
        <View style={styles.quickActionsRow}>
          {t.home.quickActionItems.map((qa, i) => (
            <TouchableOpacity
              key={QUICK_ACTION_IDS[i]}
              style={styles.quickActionCard}
              activeOpacity={0.75}
              onPress={() => {
                if (QUICK_ACTION_IDS[i] === 'coupons')
                  navigation.getParent()?.navigate('Coupons' as never);
                else if (QUICK_ACTION_IDS[i] === 'rewards')
                  navigation.getParent()?.navigate('Rewards' as never);
                else if (QUICK_ACTION_IDS[i] === 'refer')
                  navigation.getParent()?.navigate('Referrals' as never);
              }}
            >
              <View style={styles.qaIconWrap}>
                <Icon
                  name={QUICK_ACTION_ICONS[i]}
                  size={18}
                  stroke={Colors.ink}
                  sw={1.7}
                />
              </View>
              <Text style={styles.qaLabel}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: vscale(40),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vscale(12),
    marginBottom: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: fscale(42),
    height: fscale(42),
    borderRadius: fscale(21),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontSize: fscale(13),
    letterSpacing: 0.5,
  },
  greeting: {
    ...Typography.label,
    color: Colors.textTertiary,
    fontSize: fscale(10),
    marginBottom: 1,
  },
  headerTitle: { ...Typography.h4, color: Colors.textPrimary },
  headerIcons: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Location pill
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(6),
    backgroundColor: Colors.bgWhite,
    alignSelf: 'flex-start',
    paddingHorizontal: fscale(12),
    paddingVertical: fscale(7),
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '82%',
    ...Shadows.card,
  },
  locationText: {
    fontSize: fscale(13),
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
  },

  // Route card (FROM / TO)
  routeCard: {
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: fscale(14),
    paddingBottom: fscale(10),
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
  },
  routeRowLast: {
    borderBottomWidth: 0,
    paddingBottom: fscale(14),
  },
  routeDotWrap: {
    width: fscale(18),
    alignItems: 'center',
  },
  routeDot: {
    width: fscale(12),
    height: fscale(12),
    borderRadius: fscale(6),
  },
  routeDotDrop: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.textTertiary,
  },
  routeLine: {
    width: 2,
    height: fscale(18),
    backgroundColor: Colors.borderSoft,
    marginTop: fscale(4),
    position: 'absolute',
    top: fscale(14),
  },
  routeTextWrap: { flex: 1 },
  routeFieldLabel: {
    fontSize: fscale(10),
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: fscale(2),
  },
  routeFieldValue: {
    fontSize: fscale(15),
    fontWeight: '600',
    color: Colors.ink,
  },
  routeFieldPlaceholder: {
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  clearBtn: {
    width: fscale(28),
    height: fscale(28),
    borderRadius: fscale(14),
    backgroundColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchChip: {
    width: fscale(28),
    height: fscale(28),
    borderRadius: fscale(14),
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Map preview
  mapWrap: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },

  // Book button
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xl,
    paddingVertical: fscale(18),
    marginBottom: Spacing.xs,
    ...Shadows.strong,
  },
  bookBtnText: {
    fontSize: fscale(16),
    fontWeight: '700',
    color: Colors.lime,
    letterSpacing: -0.2,
  },
  bookHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    opacity: 0.55,
  },
  bookHintText: {
    fontSize: fscale(13),
    color: Colors.textTertiary,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textTertiary,
    fontSize: fscale(11),
    letterSpacing: 1,
  },

  // Services
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  serviceCard: {
    width: '31%',
    borderRadius: Radii.lg,
    paddingVertical: fscale(18),
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  serviceIconWrap: {
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  serviceLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.ink,
    fontSize: fscale(15),
    textAlign: 'center',
    marginTop: 4,
  },

  serviceSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: fscale(11),
    textAlign: 'center',
    marginTop: 3,
  },

  // Promo
  promoBanner: {
    backgroundColor: '#D4EDAA',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    paddingVertical: fscale(22),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promoLeft: { flex: 1 },
  promoEyebrow: {
    ...Typography.label,
    color: '#5A7A1A',
    fontSize: fscale(10),
    letterSpacing: 1,
    marginBottom: fscale(4),
  },
  promoTitle: {
    fontSize: fscale(20),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
    lineHeight: fscale(26),
    marginBottom: fscale(14),
  },
  promoCodeBtn: {
    backgroundColor: Colors.ink,
    alignSelf: 'flex-start',
    paddingHorizontal: fscale(16),
    paddingVertical: fscale(9),
    borderRadius: Radii.pill,
  },
  promoCodeText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontSize: fscale(13),
    letterSpacing: 0,
  },
  promoGift: {
    width: fscale(64),
    height: fscale(64),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recent rides
  card: {
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  rideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: fscale(13),
    gap: Spacing.md,
  },
  rideIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: fscale(18),
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideInfo: { flex: 1 },
  rideRoute: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontSize: fscale(13),
  },
  rideType: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    fontSize: fscale(11),
  },
  rideFareWrap: { alignItems: 'flex-end' },
  rideFare: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontSize: fscale(13),
  },
  ridePaid: {
    fontSize: fscale(11),
    color: Colors.green,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSoft,
    marginHorizontal: Spacing.md,
  },

  // Wallet
  walletCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: fscale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  walletIconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.55)',
    fontSize: fscale(10),
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: fscale(18),
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: -0.3,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: fscale(14),
    paddingVertical: fscale(8),
    borderRadius: Radii.pill,
  },
  addMoneyText: {
    ...Typography.bodySmall,
    color: Colors.textInverse,
    fontWeight: '600',
    fontSize: fscale(13),
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    paddingVertical: fscale(16),
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.card,
  },
  qaIconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: fscale(12),
  },
});

export default HomeScreen;
