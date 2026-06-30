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
import type {
  HomeTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { TopSafeStrap } from '../../components/layout';
import { NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Wallet'>,
  NativeStackScreenProps<RootStackParamList>
>;

const QUICK_STATS_BASE: {
  icon: IconName;
  value: string;
  key: 'coupons' | 'points' | 'refer';
  route: 'Coupons' | 'Rewards' | 'Referrals';
}[] = [
  { icon: 'coupon', value: '3', key: 'coupons', route: 'Coupons' },
  { icon: 'reward', value: '840', key: 'points', route: 'Rewards' },
  { icon: 'refer', value: '₹500', key: 'refer', route: 'Referrals' },
];

interface Transaction {
  icon: IconName;
  title: string;
  time: string;
  amount: string;
  color: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    icon: 'arrowRight',
    title: 'Add money via UPI',
    time: '18 Mar · 14:24',
    amount: '+₹ 2,000.00',
    color: Colors.green,
  },
  {
    icon: 'taxi',
    title: 'Auto · Sector 62 → Connaught Place',
    time: '18 Mar · 17:06',
    amount: '-₹ 110.00',
    color: Colors.ink,
  },
  {
    icon: 'car',
    title: 'E-Rickshaw · Sector 18 → Botanical Garden',
    time: '17 Mar · 09:14',
    amount: '-₹ 45.00',
    color: Colors.ink,
  },
  {
    icon: 'reward',
    title: 'NCRide points earned · 110 pts',
    time: '17 Mar · 17:08',
    amount: '+₹ 0.00',
    color: Colors.amber,
  },
  {
    icon: 'courier',
    title: 'Courier · Documents delivery',
    time: '15 Mar · 11:30',
    amount: '-₹ 99.00',
    color: Colors.ink,
  },
  {
    icon: 'refer',
    title: 'Referral bonus · Rohan joined',
    time: '12 Mar · 09:12',
    amount: '+₹ 500.00',
    color: Colors.green,
  },
];

const WalletScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const goTo = (route: 'Coupons' | 'Rewards' | 'Referrals') =>
    navigation.getParent()?.navigate(route as never);

  const QUICK_STATS = QUICK_STATS_BASE.map(s => ({
    ...s,
    label: t.wallet[s.key],
  }));

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.wallet.title}</Text>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>
                ₹ 2,184<Text style={styles.balanceDecimal}>.50</Text>
              </Text>
            </View>
            <View style={styles.balanceIconWrap}>
              <Icon name="wallet" size={22} stroke={Colors.lime} />
            </View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {QUICK_STATS.map(s => (
            <TouchableOpacity
              key={s.label}
              style={styles.statCard}
              activeOpacity={0.8}
              onPress={() => goTo(s.route)}
            >
              <Icon name={s.icon} size={20} stroke={Colors.ink} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <Text style={styles.sectionLabel}>{t.wallet.transactionsLabel}</Text>
        <NCCard pad={4}>
          {TRANSACTIONS.map((t, i) => (
            <View key={t.title}>
              <View style={styles.txRow}>
                <View style={styles.txIconWrap}>
                  <Icon name={t.icon} size={18} stroke={Colors.ink} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={styles.txTime}>{t.time}</Text>
                </View>
                <Text style={[styles.txAmount, { color: t.color }]}>
                  {t.amount}
                </Text>
              </View>
              {i < TRANSACTIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </NCCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: fscale(8),
    paddingBottom: fscale(110),
  },

  title: {
    fontSize: fscale(28),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.8,
    marginBottom: Spacing.md,
  },

  balanceCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: fscale(20),
    overflow: 'hidden',
    position: 'relative',
  },
  balanceGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 140,
    borderRadius: 80,
    backgroundColor: 'rgba(200,242,96,0.12)',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.4,
  },
  balanceAmount: {
    fontSize: fscale(34),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.2,
    marginTop: 2,
  },
  balanceDecimal: { fontSize: fscale(17), opacity: 0.7, fontWeight: '700' },
  balanceIconWrap: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnDark: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    paddingVertical: fscale(14),
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderSoft,
  },
  statValue: {
    fontSize: fscale(14),
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 6,
  },
  statLabel: {
    fontSize: fscale(10.5),
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },

  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: fscale(10),
    paddingVertical: fscale(12),
  },
  txIconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1, minWidth: 0 },
  txTitle: { fontSize: fscale(13.5), fontWeight: '600', color: Colors.ink },
  txTime: { fontSize: fscale(11), color: Colors.textSecondary, marginTop: 1 },
  txAmount: { fontSize: fscale(14), fontWeight: '800', letterSpacing: -0.2 },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(15,17,21,0.05)',
    marginHorizontal: fscale(10),
  },
});

export default WalletScreen;
