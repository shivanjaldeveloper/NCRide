import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenShell } from '../../components/layout';
import { Icon } from '../../components/common';
import { MapView } from '../../components/map';
import type { IconName } from '../../components/common';
import type { HomeTabParamList, RootStackParamList } from '../../navigation/types';
import {
  Colors,
  Typography,
  Spacing,
  fscale,
  vscale,
  Radii,
  Shadows,
} from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

// ─── Service grid data ─────────────────────────────────────────────────────
const SERVICES: { id: string; icon: IconName; label: string; sub: string; bg: string }[] = [
  { id: 'car', icon: 'car', label: 'Car', sub: 'Mini to XL', bg: '#EAF1FF' },
  { id: 'bike', icon: 'bike', label: 'Bike', sub: 'Fastest', bg: '#E6F9EC' },
  { id: 'auto', icon: 'taxi', label: 'Auto', sub: 'Nimble', bg: '#FEF6E4' },
  {
    id: 'erick',
    icon: 'car',
    label: 'E-Rickshaw',
    sub: 'Eco ride',
    bg: '#EAF1FF',
  },
  {
    id: 'reserve',
    icon: 'reserve',
    label: 'Reserve',
    sub: 'Schedule',
    bg: '#F3EEFF',
  },
  {
    id: 'intercity',
    icon: 'intercity',
    label: 'Intercity',
    sub: 'Outstation',
    bg: '#FFE9E9',
  },
];

// ─── Recent rides data ─────────────────────────────────────────────────────
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
    icon: 'car',
    from: 'Sector 62',
    to: 'Connaught Place',
    fare: '₹284',
    type: 'NCRide Mini · Yesterday',
  },
  {
    id: '2',
    icon: 'bike',
    from: 'Sector 18',
    to: 'Botanical Garden Metro',
    fare: '₹72',
    type: 'Bike Taxi · 2 days ago',
  },
  {
    id: '3',
    icon: 'car',
    from: 'Noida Sector 16',
    to: 'India Gate',
    fare: '₹448',
    type: 'NCRide Sedan · 5 days ago',
  },
];

// ─── Quick actions ─────────────────────────────────────────────────────────
const QUICK_ACTIONS: { id: string; icon: IconName; label: string }[] = [
  { id: 'coupons', icon: 'coupon', label: 'Coupons' },
  { id: 'rewards', icon: 'reward', label: 'Rewards' },
  { id: 'refer', icon: 'refer', label: 'Refer & earn' },
];

// ─── Sub-components ────────────────────────────────────────────────────────
const ServiceCard = ({
  icon,
  label,
  sub,
  bg,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub: string;
  bg: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.serviceCard}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.serviceIconWrap, { backgroundColor: bg }]}>
      <Icon name={icon} size={20} stroke={Colors.ink} sw={1.7} />
    </View>
    <Text style={styles.serviceLabel}>{label}</Text>
    <Text style={styles.serviceSub}>{sub}</Text>
  </TouchableOpacity>
);

const RideRow = ({
  icon,
  from,
  to,
  fare,
  type,
}: {
  icon: IconName;
  from: string;
  to: string;
  fare: string;
  type: string;
}) => (
  <View style={styles.rideRow}>
    <View style={styles.rideIconWrap}>
      <Icon name={icon} size={17} stroke={Colors.ink} sw={1.7} />
    </View>
    <View style={styles.rideInfo}>
      <Text style={styles.rideRoute}>
        {from} — {to}
      </Text>
      <Text style={styles.rideType}>{type}</Text>
    </View>
    <View style={styles.rideFareWrap}>
      <Text style={styles.rideFare}>{fare}</Text>
      <Text style={styles.ridePaid}>Paid</Text>
    </View>
  </View>
);

// ─── Home Screen ───────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }: Props) => {
  const goRide = (mode?: 'ride' | 'cab' | 'bike' | 'reserve' | 'intercity') =>
    navigation.getParent()?.navigate('Ride' as never, { mode } as never);

  return (
    <ScreenShell
      topColor={Colors.bgOffWhite}
      bottomColor={Colors.bgOffWhite}
      backgroundColor={Colors.bgOffWhite}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AR</Text>
            </View>
            <View>
              <Text style={styles.greeting}>GOOD MORNING</Text>
              <Text style={styles.headerTitle}>Arya, where to?</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Icon name="clock" size={16} stroke={Colors.ink} sw={1.7} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Icon name="bell" size={16} stroke={Colors.ink} sw={1.7} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Location pill ── */}
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.8}>
          <Icon name="locate" size={12} stroke={Colors.blue} sw={2} />
          <Text style={styles.locationText}>Sector 62, Noida</Text>
          <Icon name="chevronDown" size={12} stroke={Colors.textSecondary} sw={2} />
        </TouchableOpacity>

        {/* ── Search / Map card ── */}
        <View style={[styles.searchCard, Shadows.card]}>
          {/* Search row */}
          <TouchableOpacity
            style={styles.searchRow}
            activeOpacity={0.8}
            onPress={() => goRide('ride')}
          >
            <View style={styles.searchIconWrap}>
              <Icon name="search" size={17} stroke="#fff" sw={1.8} />
            </View>
            <View style={styles.searchTextWrap}>
              <Text style={styles.searchLabel}>Where to?</Text>
              <Text style={styles.searchHint}>
                Connaught Place · 38 min by car
              </Text>
            </View>
            <TouchableOpacity style={styles.laterBtn} activeOpacity={0.7}>
              <Icon name="clock" size={12} stroke={Colors.textSecondary} sw={2} />
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Map preview */}
          <View style={styles.mapPreview}>
            <MapView
              height={vscale(178)}
              showRoute
              showControls={false}
              pickup="Sector 62, Noida"
              drop="Connaught Place"
            />

            {/* Zoom controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}>
                <Text style={styles.zoomText}>−</Text>
              </TouchableOpacity>
            </View>

            {/* Book overlay */}
            <View style={styles.bookOverlay}>
              <View style={styles.bookOverlayLeft}>
                {/* Route icon */}
                <View style={styles.routeIconWrap}>
                  <Icon name="route" size={15} stroke={Colors.green} sw={2} />
                </View>
                <View>
                  <Text style={styles.routeLabel}>Suggested route</Text>
                  <Text style={styles.routeMeta}>38 min · ₹228</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                activeOpacity={0.85}
                onPress={() => goRide('ride')}
              >
                <Text style={styles.bookBtnText}>Book →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Services ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SERVICES</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICES.map(s => (
            <ServiceCard
              key={s.id}
              icon={s.icon}
              label={s.label}
              sub={s.sub}
              bg={s.bg}
              onPress={() =>
                goRide(
                  s.id === 'bike'
                    ? 'bike'
                    : s.id === 'reserve'
                    ? 'reserve'
                    : s.id === 'intercity'
                    ? 'intercity'
                    : s.id === 'car' || s.id === 'erick'
                    ? 'cab'
                    : 'ride',
                )
              }
            />
          ))}
        </View>

        {/* ── Promo banner ── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoEyebrow}>LIMITED OFFER</Text>
            <Text style={styles.promoTitle}>
              50% off your{'\n'}first NCRide
            </Text>
            <TouchableOpacity style={styles.promoCodeBtn} activeOpacity={0.85}>
              <Text style={styles.promoCodeText}>Use FIRSTRIDE →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoGift}>
            <Icon name="gift" size={48} stroke={Colors.ink} sw={1.4} />
          </View>
        </View>

        {/* ── Recent Rides ── */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>RECENT RIDES</Text>
        </View>

        <View style={[styles.card, Shadows.card]}>
          {RECENT_RIDES.map((ride, index) => (
            <View key={ride.id}>
              <RideRow
                icon={ride.icon}
                from={ride.from}
                to={ride.to}
                fare={ride.fare}
                type={ride.type}
              />
              {index < RECENT_RIDES.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        {/* ── NCRide Wallet ── */}
        <View style={[styles.walletCard, Shadows.card]}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIconWrap}>
              <Icon name="wallet" size={18} stroke={Colors.lime} sw={1.7} />
            </View>
            <View>
              <Text style={styles.walletLabel}>NCRIDE WALLET</Text>
              <Text style={styles.walletAmount}>₹ 2,184.50</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addMoneyBtn} activeOpacity={0.8}>
            <Text style={styles.addMoneyText}>+ Add money</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Actions ── */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        </View>

        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map(qa => (
            <TouchableOpacity
              key={qa.id}
              style={styles.quickActionCard}
              activeOpacity={0.75}
            >
              <View style={styles.qaIconWrap}>
                <Icon name={qa.icon} size={18} stroke={Colors.ink} sw={1.7} />
              </View>
              <Text style={styles.qaLabel}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: vscale(32),
  },

  // ── Header ──
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

  // ── Location pill ──
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgWhite,
    alignSelf: 'flex-start',
    paddingHorizontal: fscale(12),
    paddingVertical: fscale(6),
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: fscale(13),
  },

  // ── Search card ──
  searchCard: {
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchIconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTextWrap: { flex: 1 },
  searchLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontSize: fscale(16),
  },
  searchHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  laterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.pillBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: fscale(5),
    borderRadius: Radii.pill,
  },
  laterText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ── Map preview ──
  mapPreview: {
    height: vscale(178),
    position: 'relative',
    overflow: 'hidden',
  },

  zoomControls: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.sm,
    ...Shadows.card,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: fscale(30),
    height: fscale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: fscale(4),
  },
  zoomText: {
    fontSize: fscale(18),
    color: Colors.textPrimary,
    fontWeight: '400',
    lineHeight: fscale(22),
  },

  bookOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: fscale(10),
    ...Shadows.strong,
  },
  bookOverlayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeIconWrap: {
    width: fscale(30),
    height: fscale(30),
    borderRadius: Radii.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: fscale(11),
  },
  routeMeta: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: fscale(13),
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: fscale(20),
    paddingVertical: fscale(10),
    borderRadius: Radii.pill,
  },
  bookBtnText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontSize: fscale(14),
  },

  // ── Section header ──
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
  seeAll: {
    ...Typography.bodySmall,
    color: Colors.blue,
    fontWeight: '600',
    fontSize: fscale(13),
  },

  // ── Services grid ──
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  serviceCard: {
    width: '31%',
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  serviceIconWrap: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  serviceLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontSize: fscale(13),
  },
  serviceSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: fscale(11),
    marginTop: 1,
  },

  // ── Promo banner ──
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

  // ── Recent rides ──
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

  // ── Wallet ──
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

  // ── Quick actions ──
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
