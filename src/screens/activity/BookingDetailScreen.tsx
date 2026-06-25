import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCCard, Icon, Row } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

const BookingDetailScreen = ({ navigation, route }: Props) => {
  const { id, title } = route.params;
  const isRide =
    id.startsWith('NR-N22') || id.startsWith('NR-RV') || id.startsWith('NR-IC');
  const isCourier = id.startsWith('NR-CR');

  return (
    <ScreenShell>
      <HeaderBack
        title="Trip details"
        sub={id}
        onBack={() => navigation.goBack()}
        right={
          <View style={styles.shareBtn}>
            <Icon name="link" size={18} stroke={Colors.ink} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Main summary card ─────────────────────────────── */}
        <NCCard>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Icon
                name={isCourier ? 'courier' : 'taxi'}
                size={22}
                stroke={Colors.ink}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.summarySub}>
                {isCourier
                  ? 'Same-city courier · 18 Mar · 14:24'
                  : 'Auto Rickshaw · 18 Mar · 4:42 PM'}
              </Text>
            </View>
            <View style={styles.paidChip}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>

          {/* Amount row */}
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>AMOUNT PAID</Text>
              <Text style={styles.amountVal}>
                ₹ {isCourier ? '99.00' : '110.00'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountMeta}>
                {isCourier ? '2.4 km · 22 min' : '3.2 km · 18 min'}
              </Text>
              <Text style={styles.amountMeta2}>UPI · user@ncrride</Text>
            </View>
          </View>
        </NCCard>

        {/* ── Trip info ─────────────────────────────────────── */}
        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>
            {isCourier ? 'DELIVERY INFO' : 'TRIP INFO'}
          </Text>

          {isCourier ? (
            <>
              <Row
                icon="route"
                title="Route"
                sub="Sector 62 → Connaught Place"
              />
              <Row
                icon="user"
                title="Sender"
                sub="Arya Sengupta · +91 98300 12428"
              />
              <Row
                icon="user"
                title="Receiver"
                sub="Rituparna Roy · +91 99033 88817"
              />
              <Row icon="courier" title="Parcel" sub="Documents · < 0.5 kg" />
              <Row
                icon="clock"
                title="Delivered"
                sub="18 Mar · 2:42 PM → 4:38 PM"
              />
            </>
          ) : (
            <>
              <Row
                icon="route"
                title="Pickup → Drop"
                sub="Sector 62 → Connaught Place"
              />
              <Row
                icon="user"
                title="Driver"
                sub="Rajat Kr. Saha · DL 5C NC 4421 · ⭐ 4.92"
              />
              <Row
                icon="taxi"
                title="Vehicle"
                sub="Auto Rickshaw · DL 5C NC 4421"
              />
              <Row
                icon="clock"
                title="Duration"
                sub="18 Mar · 4:42 PM → 5:00 PM · 18 min"
              />
            </>
          )}
        </NCCard>

        {/* ── Fare breakup ─────────────────────────────────── */}
        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>FARE BREAKUP</Text>
          {(isCourier
            ? [
                ['Base fare', '₹ 74.00'],
                ['Platform fee', '₹ 5.00'],
                ['GST · 5%', '₹ 5.18'],
                ['Coupon · PARCEL25', '−₹ 25.00'],
              ]
            : [
                ['Base fare', '₹ 25.00'],
                ['Distance · 3.2 km', '₹ 67.20'],
                ['Platform fee', '₹ 5.00'],
                ['GST · 5%', '₹ 4.86'],
                ['Coupon · AUTORIDE30', '−₹ 30.00'],
              ]
          ).map(([k, v]) => (
            <View key={k} style={styles.fareRow}>
              <Text
                style={[
                  styles.fareKey,
                  k.startsWith('Coupon') && { color: Colors.green },
                ]}
              >
                {k}
              </Text>
              <Text
                style={[
                  styles.fareVal,
                  k.startsWith('Coupon') && { color: Colors.green },
                ]}
              >
                {v}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalVal}>
              ₹ {isCourier ? '99.00' : '110.00'}
            </Text>
          </View>
        </NCCard>

        {/* ── Actions ───────────────────────────────────────── */}
        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>ACTIONS</Text>
          <Row
            icon="invoice"
            title="Download invoice"
            onPress={() => navigation.navigate('InvoiceReceipt')}
          />
          <Row icon="receipt" title="Share receipt" />
          <Row
            icon="chat"
            title="Report an issue"
            sub="Lost item, fare dispute"
            onPress={() => navigation.navigate('SOS')}
          />
        </NCCard>

        {/* ── Support ───────────────────────────────────────── */}
        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>NEED HELP?</Text>
          <Row
            icon="chat"
            title="Chat with NCRide support"
            sub="Replies in 28 sec"
            onPress={() => navigation.navigate('SOS')}
          />
        </NCCard>
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: fscale(40),
  },

  shareBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryIcon: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
    flex: 1,
  },
  summarySub: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paidChip: {
    paddingHorizontal: fscale(8),
    paddingVertical: fscale(4),
    borderRadius: Radii.sm,
    backgroundColor: '#E9F8E4',
  },
  paidText: { fontSize: fscale(11), fontWeight: '700', color: Colors.green },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(15,17,21,0.06)',
  },
  amountLabel: {
    fontSize: fscale(10.5),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  amountVal: {
    fontSize: fscale(28),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  amountMeta: { fontSize: fscale(11.5), color: Colors.textSecondary },
  amountMeta2: {
    fontSize: fscale(11),
    color: Colors.textSecondary,
    marginTop: 2,
  },

  card: { marginTop: Spacing.md },

  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: fscale(5),
  },
  fareKey: { fontSize: fscale(13), color: Colors.textSecondary },
  fareVal: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(15,17,21,0.08)',
  },
  totalLabel: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  totalVal: {
    fontSize: fscale(16),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.4,
  },
});

export default BookingDetailScreen;
