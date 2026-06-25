import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, NCCard, Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CourierConfirmed'>;

const DETAILS = [
  ['Booking ID', 'NR-CR-552411'],
  ['Sender', 'Arya Sengupta'],
  ['Receiver', 'Rituparna Roy'],
  ['Route', 'Sector 62 → Connaught Place'],
  ['Parcel', 'Documents · < 0.5 kg'],
  ['ETA', 'Pickup in 18 min · 2–4 hr delivery'],
  ['Paid', '₹ 99.00 · UPI · user@ncrride'],
];

const CourierConfirmedScreen = ({ navigation }: Props) => (
  <ScreenShell>
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Success hero ─────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.checkCircle}>
          <Icon name="check" size={40} stroke={Colors.ink} sw={3} />
        </View>
        <Text style={styles.heroTitle}>Courier booked!</Text>
        <Text style={styles.heroSub}>
          Your parcel will be picked up shortly
        </Text>
      </View>

      {/* ── Confirmation card ────────────────────────────────── */}
      <NCCard pad={0} style={styles.confirmCard}>
        {/* dark header */}
        <View style={styles.confirmHeader}>
          <View>
            <Text style={styles.confirmHeaderLabel}>BOOKING CONFIRMED</Text>
            <Text style={styles.confirmHeaderTitle}>
              Same-city courier · Documents
            </Text>
          </View>
          <View style={styles.qrBox}>
            {/* Simple QR placeholder */}
            {[...Array(25)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.qrCell,
                  i % 3 !== 0 && { backgroundColor: 'transparent' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* perforation */}
        <View style={styles.perf}>
          <View style={styles.perfCircleL} />
          <View style={styles.perfDash} />
          <View style={styles.perfCircleR} />
        </View>

        {/* details */}
        <View style={styles.detailsWrap}>
          {DETAILS.map(([k, v]) => (
            <View key={k} style={styles.detailRow}>
              <Text style={styles.detailKey}>{k}</Text>
              <Text style={styles.detailVal}>{v}</Text>
            </View>
          ))}

          <View style={styles.paidBadge}>
            <Text style={styles.paidBadgeText}>
              PAID · UPI · user@ncrride · Today 14:24
            </Text>
          </View>
        </View>
      </NCCard>

      {/* ── Points earned ────────────────────────────────────── */}
      <NCCard style={styles.pointsCard}>
        <View style={styles.pointsRow}>
          <View style={styles.pointsIconWrap}>
            <Icon name="reward" size={20} stroke={Colors.lime} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pointsSub}>You earned</Text>
            <Text style={styles.pointsVal}>+99 NCRide points</Text>
          </View>
          <Icon name="chevron" size={18} stroke="rgba(255,255,255,0.6)" />
        </View>
      </NCCard>

      {/* ── Action buttons ───────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Icon name="link" size={18} stroke={Colors.ink} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Icon name="invoice" size={18} stroke={Colors.ink} />
          <Text style={styles.shareBtnText}>Receipt</Text>
        </TouchableOpacity>
      </View>

      <NCButton
        label="Track courier"
        iconRight="arrowRight"
        onPress={() => navigation.navigate('Tracking')}
        variant="primary"
        size="lg"
        style={styles.trackBtn}
      />

      <NCButton
        label="Back to home"
        onPress={() => navigation.navigate('HomeTabs')}
        variant="ghost"
        size="lg"
        style={styles.homeBtn}
      />
    </ScrollView>
  </ScreenShell>
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: fscale(24),
    paddingBottom: fscale(40),
  },

  hero: { alignItems: 'center', marginBottom: fscale(24) },
  checkCircle: {
    width: fscale(88),
    height: fscale(88),
    borderRadius: fscale(44),
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  heroTitle: {
    marginTop: fscale(14),
    fontSize: fscale(24),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  heroSub: {
    fontSize: fscale(13.5),
    color: Colors.textSecondary,
    marginTop: fscale(4),
  },

  confirmCard: { overflow: 'hidden' },

  confirmHeader: {
    backgroundColor: Colors.ink,
    padding: fscale(18),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmHeaderLabel: {
    fontSize: fscale(10.5),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  confirmHeaderTitle: {
    fontSize: fscale(16),
    fontWeight: '700',
    color: '#fff',
    marginTop: fscale(4),
  },
  qrBox: {
    width: fscale(60),
    height: fscale(60),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: fscale(2),
  },
  qrCell: {
    width: fscale(10),
    height: fscale(10),
    backgroundColor: '#fff',
  },

  perf: {
    flexDirection: 'row',
    alignItems: 'center',
    height: fscale(20),
  },
  perfCircleL: {
    width: fscale(20),
    height: fscale(20),
    borderRadius: fscale(10),
    backgroundColor: Colors.bgOffWhite,
    marginLeft: fscale(-10),
  },
  perfDash: {
    flex: 1,
    height: 1.5,
    borderWidth: 1,
    borderColor: 'rgba(15,17,21,0.15)',
    borderStyle: 'dashed',
    marginHorizontal: fscale(6),
  },
  perfCircleR: {
    width: fscale(20),
    height: fscale(20),
    borderRadius: fscale(10),
    backgroundColor: Colors.bgOffWhite,
    marginRight: fscale(-10),
  },

  detailsWrap: { padding: fscale(18) },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: fscale(5),
  },
  detailKey: { fontSize: fscale(12), color: Colors.textSecondary },
  detailVal: {
    fontSize: fscale(12),
    fontWeight: '600',
    color: Colors.ink,
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.sm,
  },
  paidBadge: {
    marginTop: Spacing.sm,
    padding: fscale(8),
    borderRadius: Radii.md,
    backgroundColor: '#E9F8E4',
    alignItems: 'center',
  },
  paidBadgeText: {
    fontSize: fscale(11.5),
    fontWeight: '700',
    color: Colors.green,
  },

  pointsCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.ink,
    borderColor: 'transparent',
  },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pointsIconWrap: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsSub: { fontSize: fscale(12.5), color: 'rgba(255,255,255,0.6)' },
  pointsVal: { fontSize: fscale(15), fontWeight: '700', color: '#fff' },

  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: fscale(12),
    borderRadius: Radii.lg,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  shareBtnText: { fontSize: fscale(14), fontWeight: '600', color: Colors.ink },

  trackBtn: { marginTop: Spacing.md },
  homeBtn: { marginTop: Spacing.sm },
});

export default CourierConfirmedScreen;
