import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeTabParamList, RootStackParamList } from '../../navigation/types';
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
  const datePart = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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
    return { label: `${ride.FinalFareText} · Paid`, color: Colors.ink, bg: Colors.bgOffWhite };
  }
  if (isTerminalFailureStatus(ride.Status)) {
    return { label: 'Cancelled', color: Colors.red, bg: '#FBEAE9' };
  }
  // SEARCHING / ACCEPTED / ONGOING / anything else still in-flight.
  const label = ride.Status.charAt(0) + ride.Status.slice(1).toLowerCase();
  return { label, color: Colors.blue, bg: '#E8F1FF' };
};

const ActivityScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'upcoming' | 'past'>('past');
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRides = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const cookie = await getSessionCookie();
      if (!cookie) {
        setError(t.activity.loadError);
        return;
      }
      const res = await getRideHistory({ cookie });
      setRides(res.Rides ?? []);
    } catch (err) {
      setError(isRideApiError(err) ? err.message : t.activity.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [loadRides]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRides({ silent: true });
  }, [loadRides]);

  // Only GetRideHistory exists — no separate "upcoming/scheduled" endpoint —
  // so the two tabs are derived from the same list by status: anything
  // still in-flight (SEARCHING/ACCEPTED/ONGOING) is "Upcoming", anything
  // finished either way (COMPLETED/CANCELLED/etc) is "Past".
  const upcomingRides = useMemo(
    () => rides.filter(r => !isCompletedStatus(r.Status) && !isTerminalFailureStatus(r.Status)),
    [rides],
  );
  const pastRides = useMemo(
    () => rides.filter(r => isCompletedStatus(r.Status) || isTerminalFailureStatus(r.Status)),
    [rides],
  );
  const list = tab === 'upcoming' ? upcomingRides : pastRides;
  const upcomingLabel = t.activity.upcoming.split('·')[0].trim();
  const pastLabel = t.activity.past.split('·')[0].trim();

  return (
    <View style={styles.root}>
      <TopSafeStrap backgroundColor={Colors.bgOffWhite} barStyle="dark-content" />
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
              <Text style={[styles.segLabel, tab === id && styles.segLabelActive]}>{label}</Text>
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
          <TouchableOpacity style={styles.retryBtn} activeOpacity={0.8} onPress={() => loadRides()}>
            <Text style={styles.retryText}>{t.activity.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.ink} />
          }
        >
          {list.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon name={tab === 'upcoming' ? 'clock' : 'history'} size={28} stroke={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                {tab === 'upcoming' ? t.activity.emptyUpcoming : t.activity.emptyPast}
              </Text>
              <Text style={styles.emptySub}>
                {tab === 'upcoming' ? t.activity.emptyUpcomingSub : t.activity.emptyPastSub}
              </Text>
            </View>
          ) : (
            list.map(item => {
              const icon = iconForVehicle(item.VehicleType);
              const tagInfo = tagForRide(item);
              const title = `${shortAddr(item.PickupAddress)} → ${shortAddr(item.DropAddress)}`;
              const sub = `${item.VehicleType} · ${formatDateTime(item.CreatedDate, item.CreatedTime)}`;
              return (
                <TouchableOpacity
                  key={item.RideId}
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
                        <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                        <Text style={styles.itemSub} numberOfLines={1}>{sub}</Text>
                        <Text style={styles.itemId}>#{item.RideId}</Text>
                      </View>
                      <View style={styles.itemRight}>
                        <View style={[styles.tagChip, { backgroundColor: tagInfo.bg }]}>
                          <Text style={[styles.tagText, { color: tagInfo.color }]} numberOfLines={1}>
                            {tagInfo.label}
                          </Text>
                        </View>
                        <Icon name="chevron" size={16} stroke={Colors.textTertiary} style={styles.chevron} />
                      </View>
                    </View>
                  </NCCard>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  header: { paddingHorizontal: Spacing.screen, paddingTop: fscale(8), paddingBottom: fscale(4) },
  title: { fontSize: fscale(28), fontWeight: '700', color: Colors.ink, letterSpacing: -0.8 },
  sub: { fontSize: fscale(13), color: Colors.textSecondary, marginTop: 4 },
  segWrap: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.md },
  seg: { flexDirection: 'row', gap: fscale(4), padding: fscale(4), backgroundColor: Colors.bgLight, borderRadius: Radii.lg },
  segBtn: { flex: 1, paddingVertical: fscale(10), borderRadius: fscale(11), alignItems: 'center' },
  segBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  segLabel: { fontSize: fscale(13), fontWeight: '700', color: Colors.textSecondary },
  segLabelActive: { color: Colors.ink },
  listContent: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(110), gap: Spacing.sm, flexGrow: 1 },
  card: {},
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemIcon: { width: fscale(44), height: fscale(44), borderRadius: Radii.md, backgroundColor: Colors.bgOffWhite, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink, letterSpacing: -0.2 },
  itemSub: { fontSize: fscale(11.5), color: Colors.textSecondary, marginTop: 1 },
  itemId: { fontSize: fscale(10), color: Colors.textTertiary, marginTop: fscale(6), fontVariant: ['tabular-nums'] },
  itemRight: { alignItems: 'flex-end', gap: fscale(8), maxWidth: fscale(120) },
  tagChip: { paddingHorizontal: fscale(8), paddingVertical: fscale(4), borderRadius: Radii.sm },
  tagText: { fontSize: fscale(11), fontWeight: '700' },
  chevron: { marginTop: fscale(2) },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: fscale(10), paddingHorizontal: Spacing.screen * 2 },
  centerText: { fontSize: fscale(13), color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: { marginTop: fscale(4), paddingHorizontal: fscale(20), paddingVertical: fscale(10), borderRadius: Radii.lg, backgroundColor: Colors.ink },
  retryText: { fontSize: fscale(13), fontWeight: '700', color: '#fff' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: fscale(8), paddingTop: fscale(80) },
  emptyTitle: { fontSize: fscale(15), fontWeight: '700', color: Colors.ink },
  emptySub: { fontSize: fscale(12.5), color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.screen },
});

export default ActivityScreen;
