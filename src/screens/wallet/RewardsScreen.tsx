import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCButton, NCCard, Icon, Row } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

interface WeeklyOffer {
  icon: IconName;
  title: string;
  sub: string;
  color: string;
}

const WEEKLY_OFFERS: WeeklyOffer[] = [
  {
    icon: 'taxi',
    title: '2× points',
    sub: 'On all Auto rides',
    color: '#FFF4D6',
  },
  {
    icon: 'car',
    title: '₹30 cashback',
    sub: 'On 3rd E-Rickshaw ride',
    color: '#E0FAFD',
  },
  {
    icon: 'courier',
    title: 'Free courier',
    sub: 'On parcels under 0.5 kg',
    color: '#FFE9DC',
  },
];

interface Redeemable {
  icon: IconName;
  title: string;
  cost: string;
}

const REDEEMABLES: Redeemable[] = [
  { icon: 'coupon', title: '₹50 ride credit', cost: '100 pts' },
  { icon: 'courier', title: 'Free courier pickup', cost: '180 pts' },
  { icon: 'gift', title: 'NCRide merch voucher', cost: '600 pts' },
];

const RewardsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack
          title="NCRide Rewards"
          sub="Tier · Sapphire"
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pointsCard}>
          <View style={styles.glow} />
          <View style={styles.pointsRow}>
            <View>
              <Text style={styles.label}>YOU HAVE</Text>
              <Text style={styles.pointsValue}>
                840 <Text style={styles.pointsUnit}>pts</Text>
              </Text>
            </View>
            <View style={styles.pointsIconWrap}>
              <Icon name="reward" size={26} stroke="#9AC8FF" />
            </View>
          </View>

          <Text style={styles.progressLabel}>160 PTS TO PLATINUM</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.tierRow}>
            <Text style={styles.tierText}>SAPPHIRE</Text>
            <Text style={styles.tierText}>PLATINUM</Text>
            <Text style={styles.tierText}>DIAMOND</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersRow}
        >
          {WEEKLY_OFFERS.map(o => (
            <View key={o.title} style={styles.offerCard}>
              <View
                style={[styles.offerIconWrap, { backgroundColor: o.color }]}
              >
                <Icon name={o.icon} size={18} stroke={Colors.ink} />
              </View>
              <Text style={styles.offerTitle}>{o.title}</Text>
              <Text style={styles.offerSub}>{o.sub}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>REDEEM</Text>
        <NCCard pad={4}>
          {REDEEMABLES.map(r => (
            <Row
              key={r.title}
              icon={r.icon}
              title={r.title}
              sub={r.cost}
              right={
                <NCButton
                  label="Redeem"
                  onPress={() => {}}
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                />
              }
            />
          ))}
        </NCCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },

  pointsCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: fscale(20),
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(46,125,255,0.18)',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.4,
  },
  pointsValue: {
    fontSize: fscale(36),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.2,
    marginTop: 2,
  },
  pointsUnit: { fontSize: fscale(14), opacity: 0.7, fontWeight: '600' },
  pointsIconWrap: {
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: 'rgba(46,125,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: fscale(11),
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: Spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    width: '84%',
    height: '100%',
    backgroundColor: Colors.lime,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tierText: {
    fontSize: fscale(10),
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
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

  offersRow: { gap: Spacing.sm, paddingBottom: 2 },
  offerCard: {
    minWidth: fscale(150),
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderSoft,
  },
  offerIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  offerTitle: { fontSize: fscale(13.5), fontWeight: '700', color: Colors.ink },
  offerSub: {
    fontSize: fscale(10.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

export default RewardsScreen;
