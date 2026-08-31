import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  HomeTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { TopSafeStrap } from '../../components/layout';
import { NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { getSessionCookie } from '../../utils/auth';
import {
  getRideHistory,
  isRideApiError,
  isTerminalFailureStatus,
  isCompletedStatus,
  type RideHistoryItem,
} from '../../services/rideApi';
import {
  getCachedRideHistory,
  setCachedRideHistory,
} from '../../utils/rideHistoryCache';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Activity'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Short first-line of a full address (e.g. "Meera Events, C-25, C Block…"
// → "Meera Events") — keeps the list-row title compact like the design
// reference's fixed mock titles used to be.
const shortAddr = (addr: string): string => addr.split(',')[0].trim() || addr;

// "19-08-2026" + "14:08:23" → "19 Aug, 2:08 PM". Falls back to the raw
// strings if parsing ever fails, rather than showing nothing.
const formatDateTime = (dateStr: string, timeStr: string): string => {
  if (!dateStr || !timeStr) return '';
  const [dd, mm, yyyy] = dateStr.split('-').map(Number);
  const [HH, MM] = timeStr.split(':').map(Number);
  if (!dd || !mm || !yyyy || Number.isNaN(HH) || Number.isNaN(MM)) {
    return `${dateStr} · ${timeStr.slice(0, 5)}`;
  }
  const d = new Date(yyyy, mm - 1, dd, HH, MM);
  if (Number.isNaN(d.getTime())) return `${dateStr} · ${timeStr.slice(0, 5)}`;
  const datePart = d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart}, ${timePart}`;
};

const iconForVehicle = (vehicleType: string): IconName => {
  switch ((vehicleType || '').toUpperCase()) {
    case 'BIKE':
      return 'bike';
    case 'CAR':
      return 'car';
    case 'ERICKSHAW':
      return 'taxi';
    default:
      return 'taxi';
  }
};

interface TagInfo {
  label: string;
  color: string;
  bg: string;
}

const tagForRide = (ride: RideHistoryItem): TagInfo => {
  if (isCompletedStatus(ride.Status)) {
    return {
      label: `${ride.FinalFareText} · Paid`,
      color: Colors.ink,
      bg: Colors.bgOffWhite,
    };
  }
  if (isTerminalFailureStatus(ride.Status)) {
    return { label: 'Cancelled', color: Colors.red, bg: '#FBEAE9' };
  }
  // SEARCHING / ACCEPTED / ONGOING / anything else still in-flight.
  const label = ride.Status.charAt(0) + ride.Status.slice(1).toLowerCase();
  return { label, color: Colors.blue, bg: '#E8F1FF' };
};

// GetRideHistory has no server-side paging — it always returns the whole
// list. Rendering all of it at once is what made this screen feel slow
// once a rider had a lot of rides, so we page through it client-side
// instead: render PAGE_SIZE rows, then reveal PAGE_SIZE more each time
// the list is scrolled near the bottom.
const PAGE_SIZE = 10;

const ActivityScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'upcoming' | 'past'>('past');
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  // `loading` -> center loader, only when there's neither cached nor
  // fresh data yet. `refreshing` -> pull-to-refresh spinner. A
  // background/silent refetch (cache revalidation, refocus) uses
  // neither — the list just stays up and updates quietly.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // How many rows of the current tab's filtered list are rendered. Grows
  // by PAGE_SIZE as the user scrolls; resets whenever the underlying list
  // changes shape (tab switch, refresh landing a different rides array)
  // so scrolling always starts fresh for whatever's now shown.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  type LoadMode = 'initial' | 'manual' | 'silent';

  const loadRides = useCallback(
    async (mode: LoadMode = 'initial') => {
      if (mode === 'initial') setLoading(true);
      if (mode === 'manual') setRefreshing(true);
      if (mode !== 'silent') setError(null);
      try {
        const cookie = await getSessionCookie();
        if (!cookie) {
          if (mode !== 'silent') setError(t.activity.loadError);
          return;
        }
        const res = await getRideHistory({ cookie });
        const list = res.Rides ?? [];
        setRides(list);
        // Best-effort — a cache write failure shouldn't affect what's
        // already showing on screen.
        setCachedRideHistory(list);
      } catch (err) {
        // A silent background refetch failing shouldn't yank the
        // already-visible list away and replace it with an error screen —
        // just leave the last-known list up and try again next time.
        if (mode !== 'silent') {
          setError(isRideApiError(err) ? err.message : t.activity.loadError);
        }
      } finally {
        if (mode === 'initial') setLoading(false);
        if (mode === 'manual') setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    (async () => {
      // Cache-first: paint whatever we last saw immediately (no
      // spinner), then quietly revalidate against the server. Only fall
      // back to the loading spinner when there's truly nothing cached
      // yet — e.g. first-ever open.
      const cached = await getCachedRideHistory();
      if (cached && cached.length > 0) {
        setRides(cached);
        setLoading(false);
        loadRides('silent');
      } else {
        loadRides('initial');
      }
    })();
    // Only run once on mount — refetching on refocus is handled by the
    // focus effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh silently every time Activity regains focus (e.g. after
  // finishing a ride) so the list doesn't go stale. The mount effect
  // above already handles the very first focus, so this only matters for
  // subsequent ones.
  const [hasFocusedOnce, setHasFocusedOnce] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce) {
        setHasFocusedOnce(true);
        return;
      }
      loadRides('silent');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasFocusedOnce]),
  );

  const onRefresh = useCallback(() => {
    loadRides('manual');
  }, [loadRides]);

  // Only GetRideHistory exists — no separate "upcoming/scheduled" endpoint —
  // so the two tabs are derived from the same list by status: anything
  // still in-flight (SEARCHING/ACCEPTED/ONGOING) is "Upcoming", anything
  // finished either way (COMPLETED/CANCELLED/etc) is "Past".
  const upcomingRides = useMemo(
    () =>
      rides.filter(
        r => !isCompletedStatus(r.Status) && !isTerminalFailureStatus(r.Status),
      ),
    [rides],
  );
  const pastRides = useMemo(
    () =>
      rides.filter(
        r => isCompletedStatus(r.Status) || isTerminalFailureStatus(r.Status),
      ),
    [rides],
  );
  const list = tab === 'upcoming' ? upcomingRides : pastRides;

  // Reset paging whenever the visible list changes shape — switching
  // tabs, a refresh landing a different rides array, etc.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, rides]);

  const paginated = useMemo(
    () => list.slice(0, visibleCount),
    [list, visibleCount],
  );
  const hasMore = visibleCount < list.length;

  const handleEndReached = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount(v => Math.min(v + PAGE_SIZE, list.length));
  }, [hasMore, list.length]);

  const upcomingLabel = t.activity.upcoming.split('·')[0].trim();
  const pastLabel = t.activity.past.split('·')[0].trim();

  const renderItem = useCallback(
    ({ item }: { item: RideHistoryItem }) => {
      const icon = iconForVehicle(item.VehicleType);
      const tagInfo = tagForRide(item);
      const title = `${shortAddr(item.PickupAddress)} → ${shortAddr(
        item.DropAddress,
      )}`;
      const sub = `${item.VehicleType} · ${formatDateTime(
        item.CreatedDate,
        item.CreatedTime,
      )}`;
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('BookingDetail', {
              rideTran: item.RideTran,
              title,
              icon,
            })
          }
        >
          <NCCard pad={fscale(14)} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.itemIcon}>
                <Icon name={icon} size={20} stroke={Colors.ink} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                  {sub}
                </Text>
                <Text style={styles.itemId}>#{item.RideId}</Text>
              </View>
              <View style={styles.itemRight}>
                <View style={[styles.tagChip, { backgroundColor: tagInfo.bg }]}>
                  <Text
                    style={[styles.tagText, { color: tagInfo.color }]}
                    numberOfLines={1}
                  >
                    {tagInfo.label}
                  </Text>
                </View>
                <Icon
                  name="chevron"
                  size={16}
                  stroke={Colors.textTertiary}
                  style={styles.chevron}
                />
              </View>
            </View>
          </NCCard>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <View style={styles.header}>
        <Text style={styles.title}>{t.activity.title}</Text>
        <Text style={styles.sub}>{t.activity.sub}</Text>
      </View>
      <View style={styles.segWrap}>
        <View style={styles.seg}>
          {(
            [
              ['upcoming', `${upcomingLabel} · ${upcomingRides.length}`],
              ['past', `${pastLabel} · ${pastRides.length}`],
            ] as const
          ).map(([id, label]) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.8}
              onPress={() => setTab(id)}
              style={[styles.segBtn, tab === id && styles.segBtnActive]}
            >
              <Text
                style={[styles.segLabel, tab === id && styles.segLabelActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && rides.length === 0 ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={Colors.ink} />
          <Text style={styles.centerText}>{t.activity.loading}</Text>
        </View>
      ) : error && rides.length === 0 ? (
        <View style={styles.centerFill}>
          <Icon name="close" size={22} stroke={Colors.red} />
          <Text style={styles.centerText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.8}
            onPress={() => loadRides()}
          >
            <Text style={styles.retryText}>{t.activity.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={paginated}
          keyExtractor={item => item.RideId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.ink}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={PAGE_SIZE}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon
                name={tab === 'upcoming' ? 'clock' : 'history'}
                size={28}
                stroke={Colors.textTertiary}
              />
              <Text style={styles.emptyTitle}>
                {tab === 'upcoming'
                  ? t.activity.emptyUpcoming
                  : t.activity.emptyPast}
              </Text>
              <Text style={styles.emptySub}>
                {tab === 'upcoming'
                  ? t.activity.emptyUpcomingSub
                  : t.activity.emptyPastSub}
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Colors.textTertiary} size="small" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: fscale(8),
    paddingBottom: fscale(4),
  },
  title: {
    fontSize: fscale(28),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.8,
  },
  sub: { fontSize: fscale(13), color: Colors.textSecondary, marginTop: 4 },
  segWrap: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.md },
  seg: {
    flexDirection: 'row',
    gap: fscale(4),
    padding: fscale(4),
    backgroundColor: Colors.bgLight,
    borderRadius: Radii.lg,
  },
  segBtn: {
    flex: 1,
    paddingVertical: fscale(10),
    borderRadius: fscale(11),
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segLabel: {
    fontSize: fscale(13),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segLabelActive: { color: Colors.ink },
  listContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: fscale(110),
    gap: Spacing.sm,
    flexGrow: 1,
  },
  card: {},
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemIcon: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  itemSub: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemId: {
    fontSize: fscale(10),
    color: Colors.textTertiary,
    marginTop: fscale(6),
    fontVariant: ['tabular-nums'],
  },
  itemRight: { alignItems: 'flex-end', gap: fscale(8), maxWidth: fscale(120) },
  tagChip: {
    paddingHorizontal: fscale(8),
    paddingVertical: fscale(4),
    borderRadius: Radii.sm,
  },
  tagText: { fontSize: fscale(11), fontWeight: '700' },
  chevron: { marginTop: fscale(2) },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: fscale(10),
    paddingHorizontal: Spacing.screen * 2,
  },
  centerText: {
    fontSize: fscale(13),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: fscale(4),
    paddingHorizontal: fscale(20),
    paddingVertical: fscale(10),
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
  },
  retryText: { fontSize: fscale(13), fontWeight: '700', color: '#fff' },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: fscale(8),
    paddingTop: fscale(80),
  },
  emptyTitle: { fontSize: fscale(15), fontWeight: '700', color: Colors.ink },
  emptySub: {
    fontSize: fscale(12.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.screen,
  },
  footerLoader: { paddingVertical: fscale(16) },
});

export default ActivityScreen;
