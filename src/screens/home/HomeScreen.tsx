import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TopSafeStrap } from '../../components/layout';
import { Icon } from '../../components/common';
import { MapView } from '../../components/map';
import type { IconName } from '../../components/common';
import type { HomeTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, fscale, vscale, Radii, Shadows } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SERVICE_ICONS: IconName[] = ['taxi', 'car', 'courier'];
const SERVICE_BG = ['#FEF6E4', '#E0FAFD', '#FFE9DC'];
const SERVICE_IDS = ['auto', 'erickshaw', 'courier'];

const QUICK_ACTION_ICONS: IconName[] = ['coupon', 'reward', 'refer'];
const QUICK_ACTION_IDS = ['coupons', 'rewards', 'refer'];

const RECENT_RIDES: { id: string; icon: IconName; from: string; to: string; fare: string; type: string }[] = [
  { id: '1', icon: 'taxi', from: 'Sector 62', to: 'Connaught Place', fare: '₹110', type: 'Auto · Yesterday' },
  { id: '2', icon: 'car', from: 'Sector 18', to: 'Botanical Garden Metro', fare: '₹45', type: 'E-Rickshaw · 2 days ago' },
  { id: '3', icon: 'taxi', from: 'Noida Sector 16', to: 'India Gate', fare: '₹96', type: 'Auto · 5 days ago' },
];

const HomeScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  const goRide = (mode: 'auto' | 'erickshaw') => navigation.getParent()?.navigate('Ride' as never, { mode } as never);
  const goCourier = () => navigation.getParent()?.navigate('Courier' as never);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgOffWhite }}>
      <TopSafeStrap backgroundColor={Colors.bgOffWhite} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}><Text style={styles.avatarText}>AR</Text></View>
            <View>
              <Text style={styles.greeting}>{t.home.greeting}</Text>
              <Text style={styles.headerTitle}>{t.home.headerTitle}</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.getParent()?.navigate('SOS' as never)}>
              <Icon name="sos" size={16} stroke={Colors.red} sw={1.7} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.getParent()?.navigate('Notifications' as never)}>
              <Icon name="bell" size={16} stroke={Colors.ink} sw={1.7} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location pill */}
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.8}>
          <Icon name="locate" size={12} stroke={Colors.blue} sw={2} />
          <Text style={styles.locationText}>Sector 62, Noida</Text>
          <Icon name="chevronDown" size={12} stroke={Colors.textSecondary} sw={2} />
        </TouchableOpacity>

        {/* Search / Map card */}
        <View style={[styles.searchCard, Shadows.card]}>
          <TouchableOpacity style={styles.searchRow} activeOpacity={0.8} onPress={() => goRide('auto')}>
            <View style={styles.searchIconWrap}>
              <Icon name="search" size={17} stroke="#fff" sw={1.8} />
            </View>
            <View style={styles.searchTextWrap}>
              <Text style={styles.searchLabel}>{t.home.whereToLabel}</Text>
              <Text style={styles.searchHint}>Connaught Place · 26 min by auto</Text>
            </View>
            <TouchableOpacity style={styles.laterBtn} activeOpacity={0.7}>
              <Icon name="clock" size={12} stroke={Colors.textSecondary} sw={2} />
              <Text style={styles.laterText}>{t.common.later}</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.mapPreview}>
            <MapView height={vscale(178)} showRoute showControls={false} pickup="Sector 62, Noida" drop="Connaught Place" />
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}><Text style={styles.zoomText}>+</Text></TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}><Text style={styles.zoomText}>−</Text></TouchableOpacity>
            </View>
            <View style={styles.bookOverlay}>
              <View style={styles.bookOverlayLeft}>
                <View style={styles.routeIconWrap}>
                  <Icon name="route" size={15} stroke={Colors.green} sw={2} />
                </View>
                <View>
                  <Text style={styles.routeLabel}>{t.home.suggestedRoute}</Text>
                  <Text style={styles.routeMeta}>26 min · ₹96</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85} onPress={() => goRide('auto')}>
                <Text style={styles.bookBtnText}>{t.home.book}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home.services}</Text>
        </View>
        <View style={styles.servicesGrid}>
          {t.home.serviceItems.map((s, i) => (
            <TouchableOpacity
              key={SERVICE_IDS[i]}
              style={styles.serviceCard}
              activeOpacity={0.75}
              onPress={() => SERVICE_IDS[i] === 'courier' ? goCourier() : goRide(SERVICE_IDS[i] === 'erickshaw' ? 'erickshaw' : 'auto')}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: SERVICE_BG[i] }]}>
                <Icon name={SERVICE_ICONS[i]} size={20} stroke={Colors.ink} sw={1.7} />
              </View>
              <Text style={styles.serviceLabel}>{s.label}</Text>
              <Text style={styles.serviceSub}>{s.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo banner */}
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

        {/* Recent Rides */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>{t.home.recentRides}</Text>
        </View>
        <View style={[styles.card, Shadows.card]}>
          {RECENT_RIDES.map((ride, index) => (
            <View key={ride.id}>
              <View style={styles.rideRow}>
                <View style={styles.rideIconWrap}>
                  <Icon name={ride.icon} size={17} stroke={Colors.ink} sw={1.7} />
                </View>
                <View style={styles.rideInfo}>
                  <Text style={styles.rideRoute}>{ride.from} — {ride.to}</Text>
                  <Text style={styles.rideType}>{ride.type}</Text>
                </View>
                <View style={styles.rideFareWrap}>
                  <Text style={styles.rideFare}>{ride.fare}</Text>
                  <Text style={styles.ridePaid}>{t.common.paid}</Text>
                </View>
              </View>
              {index < RECENT_RIDES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Wallet */}
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

        {/* Quick Actions */}
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
                if (QUICK_ACTION_IDS[i] === 'coupons') navigation.getParent()?.navigate('Coupons' as never);
                else if (QUICK_ACTION_IDS[i] === 'rewards') navigation.getParent()?.navigate('Rewards' as never);
                else if (QUICK_ACTION_IDS[i] === 'refer') navigation.getParent()?.navigate('Referrals' as never);
              }}
            >
              <View style={styles.qaIconWrap}>
                <Icon name={QUICK_ACTION_ICONS[i]} size={18} stroke={Colors.ink} sw={1.7} />
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
  scrollContent: { paddingHorizontal: Spacing.screen, paddingBottom: vscale(32) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: vscale(12), marginBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: fscale(42), height: fscale(42), borderRadius: fscale(21), backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.label, color: Colors.textInverse, fontSize: fscale(13), letterSpacing: 0.5 },
  greeting: { ...Typography.label, color: Colors.textTertiary, fontSize: fscale(10), marginBottom: 1 },
  headerTitle: { ...Typography.h4, color: Colors.textPrimary },
  headerIcons: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: fscale(36), height: fscale(36), borderRadius: Radii.sm, backgroundColor: Colors.bgWhite, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.bgWhite, alignSelf: 'flex-start', paddingHorizontal: fscale(12), paddingVertical: fscale(6), borderRadius: Radii.pill, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  locationText: { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '600', fontSize: fscale(13) },
  searchCard: { backgroundColor: Colors.bgWhite, borderRadius: Radii.xl, overflow: 'hidden', marginBottom: Spacing.xl },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  searchIconWrap: { width: fscale(38), height: fscale(38), borderRadius: Radii.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchTextWrap: { flex: 1 },
  searchLabel: { ...Typography.h4, color: Colors.textPrimary, fontSize: fscale(16) },
  searchHint: { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  laterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.pillBg, paddingHorizontal: Spacing.sm, paddingVertical: fscale(5), borderRadius: Radii.pill },
  laterText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '500' },
  mapPreview: { height: vscale(178), position: 'relative', overflow: 'hidden' },
  zoomControls: { position: 'absolute', right: Spacing.sm, top: Spacing.sm, backgroundColor: Colors.bgWhite, borderRadius: Radii.sm, ...Shadows.card, overflow: 'hidden' },
  zoomBtn: { width: fscale(30), height: fscale(30), alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: fscale(4) },
  zoomText: { fontSize: fscale(18), color: Colors.textPrimary, fontWeight: '400', lineHeight: fscale(22) },
  bookOverlay: { position: 'absolute', bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm, backgroundColor: Colors.bgWhite, borderRadius: Radii.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: fscale(10), ...Shadows.strong },
  bookOverlayLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  routeIconWrap: { width: fscale(30), height: fscale(30), borderRadius: Radii.sm, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  routeLabel: { ...Typography.caption, color: Colors.textSecondary, fontSize: fscale(11) },
  routeMeta: { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '700', fontSize: fscale(13) },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: fscale(20), paddingVertical: fscale(10), borderRadius: Radii.pill },
  bookBtnText: { ...Typography.button, color: Colors.textInverse, fontSize: fscale(14) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.label, color: Colors.textTertiary, fontSize: fscale(11), letterSpacing: 1 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  serviceCard: { width: '31%', backgroundColor: Colors.bgWhite, borderRadius: Radii.lg, padding: Spacing.md, ...Shadows.card },
  serviceIconWrap: { width: fscale(40), height: fscale(40), borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  serviceLabel: { ...Typography.bodySmall, fontWeight: '700', color: Colors.textPrimary, fontSize: fscale(13) },
  serviceSub: { ...Typography.caption, color: Colors.textSecondary, fontSize: fscale(11), marginTop: 1 },
  promoBanner: { backgroundColor: '#D4EDAA', borderRadius: Radii.xl, padding: Spacing.xl, paddingVertical: fscale(22), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  promoLeft: { flex: 1 },
  promoEyebrow: { ...Typography.label, color: '#5A7A1A', fontSize: fscale(10), letterSpacing: 1, marginBottom: fscale(4) },
  promoTitle: { fontSize: fscale(20), fontWeight: '800', color: Colors.ink, letterSpacing: -0.5, lineHeight: fscale(26), marginBottom: fscale(14) },
  promoCodeBtn: { backgroundColor: Colors.ink, alignSelf: 'flex-start', paddingHorizontal: fscale(16), paddingVertical: fscale(9), borderRadius: Radii.pill },
  promoCodeText: { ...Typography.button, color: Colors.textInverse, fontSize: fscale(13), letterSpacing: 0 },
  promoGift: { width: fscale(64), height: fscale(64), alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.bgWhite, borderRadius: Radii.xl, overflow: 'hidden', marginBottom: Spacing.md },
  rideRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: fscale(13), gap: Spacing.md },
  rideIconWrap: { width: fscale(36), height: fscale(36), borderRadius: fscale(18), backgroundColor: Colors.pillBg, alignItems: 'center', justifyContent: 'center' },
  rideInfo: { flex: 1 },
  rideRoute: { ...Typography.bodySmall, fontWeight: '600', color: Colors.textPrimary, fontSize: fscale(13) },
  rideType: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2, fontSize: fscale(11) },
  rideFareWrap: { alignItems: 'flex-end' },
  rideFare: { ...Typography.bodySmall, fontWeight: '700', color: Colors.textPrimary, fontSize: fscale(13) },
  ridePaid: { fontSize: fscale(11), color: Colors.green, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderSoft, marginHorizontal: Spacing.md },
  walletCard: { backgroundColor: Colors.ink, borderRadius: Radii.xl, paddingHorizontal: Spacing.lg, paddingVertical: fscale(16), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  walletIconWrap: { width: fscale(38), height: fscale(38), borderRadius: Radii.sm, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  walletLabel: { ...Typography.label, color: 'rgba(255,255,255,0.55)', fontSize: fscale(10), letterSpacing: 0.8, marginBottom: 2 },
  walletAmount: { fontSize: fscale(18), fontWeight: '700', color: Colors.textInverse, letterSpacing: -0.3 },
  addMoneyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: fscale(14), paddingVertical: fscale(8), borderRadius: Radii.pill },
  addMoneyText: { ...Typography.bodySmall, color: Colors.textInverse, fontWeight: '600', fontSize: fscale(13) },
  quickActionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  quickActionCard: { flex: 1, backgroundColor: Colors.bgWhite, borderRadius: Radii.lg, paddingVertical: fscale(16), alignItems: 'center', gap: Spacing.sm, ...Shadows.card },
  qaIconWrap: { width: fscale(38), height: fscale(38), borderRadius: Radii.md, backgroundColor: Colors.pillBg, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { ...Typography.caption, color: Colors.textPrimary, fontWeight: '600', fontSize: fscale(12) },
});

export default HomeScreen;
