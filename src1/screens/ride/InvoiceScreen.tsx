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
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCButton, NCCard, Icon, Row } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Invoice'>;

const FARE_LINES: [string, string][] = [
  ['Base fare', '₹ 45.00'],
  ['Distance · 9.4 km × ₹13.4', '₹ 125.96'],
  ['Time · 24 min × ₹0.75', '₹ 18.00'],
  ['Platform fee', '₹ 5.00'],
  ['GST · 5%', '₹ 9.65'],
];

const TRIP_DETAILS: {
  icon: 'route' | 'user' | 'taxi' | 'clock';
  title: string;
  sub: string;
}[] = [
  {
    icon: 'route',
    title: 'Pickup → Drop',
    sub: 'Sector 62, Noida → Connaught Place',
  },
  { icon: 'user', title: 'Driver', sub: 'Rajat Kr. Saha · DL 5C NC 4421' },
  { icon: 'taxi', title: 'Vehicle', sub: 'Auto Rickshaw · Yellow & Green' },
  { icon: 'clock', title: 'Time', sub: '4:42 PM → 5:06 PM' },
];

const InvoiceScreen = ({ navigation }: Props) => {
  return (
    <ScreenShell>
      <HeaderBack
        title="Trip invoice"
        sub="Booking NR-N22-78421"
        onBack={() => navigation.navigate('Completed')}
        right={
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
            <Icon name="link" size={18} stroke={Colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NCCard pad={0} style={styles.card}>
          <View style={styles.mapWrap}>
            <MapView
              height={140}
              pickup="Sector 62, Noida"
              drop="Connaught Place"
              showControls={false}
            />
          </View>
          <View style={styles.totalBlock}>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.label}>TOTAL PAYABLE</Text>
                <Text style={styles.totalAmount}>₹ 184.00</Text>
              </View>
              <View style={styles.unpaidChip}>
                <Text style={styles.unpaidText}>Unpaid</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>18 Mar, 4:42 PM</Text>
              <Text style={styles.metaText}>· 9.4 km</Text>
              <Text style={styles.metaText}>· 24 min</Text>
            </View>
          </View>
        </NCCard>

        <NCCard style={styles.card}>
          <Text style={styles.label}>FARE BREAKDOWN</Text>
          {FARE_LINES.map(([k, v]) => (
            <View key={k} style={styles.fareRow}>
              <Text style={styles.fareKey}>{k}</Text>
              <Text style={styles.fareVal}>{v}</Text>
            </View>
          ))}
          <View style={styles.fareRow}>
            <Text style={[styles.fareKey, styles.green]}>Coupon · NCR50</Text>
            <Text style={[styles.fareVal, styles.green]}>−₹ 19.61</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={[styles.fareKey, styles.green]}>Wallet credit</Text>
            <Text style={[styles.fareVal, styles.green]}>−₹ 0.00</Text>
          </View>
          <View style={styles.totalDivider}>
            <Text style={styles.totalLabel}>Total payable</Text>
            <Text style={styles.totalValue}>₹ 184.00</Text>
          </View>
        </NCCard>

        <NCCard style={styles.card}>
          <Text style={styles.label}>TRIP DETAILS</Text>
          {TRIP_DETAILS.map(d => (
            <Row key={d.title} icon={d.icon} title={d.title} sub={d.sub} />
          ))}
        </NCCard>
      </ScrollView>

      <View style={styles.bottomBar}>
        <NCButton
          label="Pay ₹ 184.00"
          iconRight="arrowRight"
          onPress={() => navigation.navigate('PayRide')}
          variant="primary"
          size="lg"
        />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  shareBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(110) },
  card: { marginTop: Spacing.sm },

  mapWrap: { padding: Spacing.md },
  totalBlock: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(15,17,21,0.15)',
    borderStyle: 'dashed',
    padding: Spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: fscale(30),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -1,
    marginTop: 2,
  },
  unpaidChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(224,82,78,0.1)',
  },
  unpaidText: { fontSize: fscale(11), fontWeight: '700', color: Colors.red },
  metaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  metaText: { fontSize: fscale(11.5), color: Colors.textSecondary },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fareKey: { fontSize: fscale(13.5), color: Colors.ink2 },
  fareVal: { fontSize: fscale(13.5), color: Colors.ink2, fontWeight: '600' },
  green: { color: Colors.green },
  totalDivider: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  totalValue: {
    fontSize: fscale(16),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.4,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: fscale(30),
    backgroundColor: 'rgba(244,244,242,0.95)',
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderSoft,
  },
});

export default InvoiceScreen;
