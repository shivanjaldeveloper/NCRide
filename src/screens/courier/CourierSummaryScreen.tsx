import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCButton, NCCard, Icon, Row } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'CourierSummary'>;

const FARE_ROWS: [string, string][] = [
  ['Base fare', '₹ 74.00'],
  ['Weight · 0.3 kg × ₹15', '₹ 4.50'],
  ['Pickup charge', '₹ 20.00'],
  ['Platform fee', '₹ 5.00'],
  ['GST · 5%', '₹ 5.18'],
];

const CourierSummaryScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <HeaderBack title={t.courier.summaryTitle} sub={t.courier.summaryReview} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NCCard>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIcon}><Icon name="courier" size={22} stroke={Colors.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{t.courier.serviceTitle}</Text>
              <Text style={styles.serviceSub}>Sector 62, Noida → Connaught Place</Text>
            </View>
          </View>
          <View style={styles.detailsGrid}>
            {[['Sender', 'Arya Sengupta'], ['Receiver', 'Rituparna Roy'], ['Weight', '< 0.5 kg · Documents'], ['ETA', 'Pickup in 18 min']].map(([k, v]) => (
              <View key={k} style={styles.detailItem}>
                <Text style={styles.detailKey}>{k}</Text>
                <Text style={styles.detailVal}>{v}</Text>
              </View>
            ))}
          </View>
        </NCCard>

        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>{t.courier.fareBreakdown}</Text>
          {FARE_ROWS.map(([k, v]) => (
            <View key={k} style={styles.fareRow}>
              <Text style={styles.fareKey}>{k}</Text>
              <Text style={styles.fareVal}>{v}</Text>
            </View>
          ))}
          <View style={styles.fareRow}>
            <Text style={[styles.fareKey, { color: Colors.green }]}>Coupon · PARCEL25</Text>
            <Text style={[styles.fareVal, { color: Colors.green }]}>−₹ 9.68</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.courier.totalPayable}</Text>
            <Text style={styles.totalVal}>₹ 99.00</Text>
          </View>
        </NCCard>

        <TouchableOpacity activeOpacity={0.8} onPress={() => {}} style={styles.couponCard}>
          <NCCard pad={0}>
            <Row icon="coupon" title={t.ride.applyCoupon} sub="8 offers available · PARCEL25 saves ₹25" />
          </NCCard>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Icon name="shield" size={16} stroke={Colors.blue} />
          <Text style={styles.infoText}>{t.courier.secureNote}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.totalSummary}>
          <Text style={styles.totalSummaryLabel}>TOTAL</Text>
          <Text style={styles.totalSummaryVal}>₹ 99.00</Text>
        </View>
        <NCButton label={t.courier.proceedPayBtn} iconRight="arrowRight" onPress={() => navigation.navigate('CourierPayment')} variant="primary" size="lg" style={{ flex: 1 }} />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(120) },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  serviceIcon: { width: fscale(44), height: fscale(44), borderRadius: Radii.md, backgroundColor: '#FFE9DC', alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink, letterSpacing: -0.2 },
  serviceSub: { fontSize: fscale(11.5), color: Colors.textSecondary, marginTop: 2 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingTop: Spacing.md, borderTopWidth: 0.5, borderTopColor: 'rgba(15,17,21,0.06)' },
  detailItem: { width: '48%' },
  detailKey: { fontSize: fscale(10.5), fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase' },
  detailVal: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink, marginTop: 2 },
  card: { marginTop: Spacing.md },
  sectionLabel: { fontSize: fscale(11), fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: Spacing.sm },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: fscale(5) },
  fareKey: { fontSize: fscale(13), color: Colors.textSecondary },
  fareVal: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: 'rgba(15,17,21,0.08)', marginTop: Spacing.sm, paddingTop: Spacing.sm },
  totalLabel: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  totalVal: { fontSize: fscale(16), fontWeight: '800', color: Colors.ink, letterSpacing: -0.4 },
  couponCard: { marginTop: Spacing.md },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, padding: fscale(10), paddingHorizontal: Spacing.md, backgroundColor: 'rgba(46,125,255,0.06)', borderRadius: Radii.md },
  infoText: { fontSize: fscale(11.5), color: Colors.ink2, flex: 1, lineHeight: fscale(16) },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: fscale(30), backgroundColor: 'rgba(244,244,242,0.95)', borderTopWidth: 0.5, borderTopColor: 'rgba(15,17,21,0.06)' },
  totalSummary: { gap: 2 },
  totalSummaryLabel: { fontSize: fscale(10), fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  totalSummaryVal: { fontSize: fscale(18), fontWeight: '800', color: Colors.ink, letterSpacing: -0.4 },
});

export default CourierSummaryScreen;
