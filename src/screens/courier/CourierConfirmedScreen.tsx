import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, NCCard, Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'CourierConfirmed'>;

const DETAIL_VALUES = [
  'NR-CR-552411',
  'Arya Sengupta',
  'Rituparna Roy',
  'Sector 62 → Connaught Place',
  'Documents · < 0.5 kg',
  'Pickup in 18 min · 2–4 hr delivery',
  '₹ 99.00 · UPI · user@ncrride',
];

const CourierConfirmedScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={40} stroke={Colors.ink} sw={3} />
          </View>
          <Text style={styles.heroTitle}>{t.courier.confirmedTitle}</Text>
          <Text style={styles.heroSub}>{t.courier.confirmedSub}</Text>
        </View>

        <NCCard pad={0} style={styles.confirmCard}>
          <View style={styles.confirmHeader}>
            <View>
              <Text style={styles.confirmHeaderLabel}>{t.courier.confirmHeaderLabel}</Text>
              <Text style={styles.confirmHeaderTitle}>{t.courier.confirmServiceTitle}</Text>
            </View>
            <View style={styles.qrBox}>
              {[...Array(25)].map((_, i) => (
                <View key={i} style={[styles.qrCell, i % 3 !== 0 && { backgroundColor: 'transparent' }]} />
              ))}
            </View>
          </View>

          <View style={styles.perf}>
            <View style={styles.perfCircleL} />
            <View style={styles.perfDash} />
            <View style={styles.perfCircleR} />
          </View>

          <View style={styles.detailsWrap}>
            {t.courier.detailKeys.map((k, i) => (
              <View key={k} style={styles.detailRow}>
                <Text style={styles.detailKey}>{k}</Text>
                <Text style={styles.detailVal}>{DETAIL_VALUES[i]}</Text>
              </View>
            ))}
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>PAID · UPI · user@ncrride · Today 14:24</Text>
            </View>
          </View>
        </NCCard>

        <NCCard style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsIconWrap}><Icon name="reward" size={20} stroke={Colors.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointsSub}>{t.receipt.youEarned}</Text>
              <Text style={styles.pointsVal}>+99 NCRide points</Text>
            </View>
            <Icon name="chevron" size={18} stroke={Colors.ink} />
          </View>
        </NCCard>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={() => {}}>
            <Icon name="link" size={18} stroke={Colors.ink} />
            <Text style={styles.shareBtnText}>{t.receipt.share}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={() => {}}>
            <Icon name="invoice" size={18} stroke={Colors.ink} />
            <Text style={styles.shareBtnText}>{t.receipt.receiptLabel}</Text>
          </TouchableOpacity>
        </View>

        <NCButton label={t.courier.homeBtn} onPress={() => navigation.navigate('HomeTabs')} variant="primary" size="lg" style={styles.homeBtn} />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingTop: fscale(24), paddingBottom: fscale(40) },
  hero: { alignItems: 'center', marginBottom: fscale(24) },
  checkCircle: { width: fscale(88), height: fscale(88), borderRadius: fscale(44), backgroundColor: Colors.lime, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.lime, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 8 },
  heroTitle: { marginTop: fscale(14), fontSize: fscale(24), fontWeight: '700', color: Colors.ink, letterSpacing: -0.6 },
  heroSub: { fontSize: fscale(13.5), color: Colors.textSecondary, marginTop: fscale(4) },
  confirmCard: { overflow: 'hidden' },
  confirmHeader: { backgroundColor: Colors.ink, padding: fscale(18), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confirmHeaderLabel: { fontSize: fscale(10.5), fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' },
  confirmHeaderTitle: { fontSize: fscale(16), fontWeight: '700', color: '#fff', marginTop: fscale(4) },
  qrBox: { width: fscale(60), height: fscale(60), flexDirection: 'row', flexWrap: 'wrap', gap: fscale(2) },
  qrCell: { width: fscale(10), height: fscale(10), backgroundColor: '#fff' },
  perf: { flexDirection: 'row', alignItems: 'center', height: fscale(20) },
  perfCircleL: { width: fscale(20), height: fscale(20), borderRadius: fscale(10), backgroundColor: Colors.bgOffWhite, marginLeft: fscale(-10) },
  perfDash: { flex: 1, height: 1.5, borderWidth: 1, borderColor: 'rgba(15,17,21,0.15)', borderStyle: 'dashed', marginHorizontal: fscale(6) },
  perfCircleR: { width: fscale(20), height: fscale(20), borderRadius: fscale(10), backgroundColor: Colors.bgOffWhite, marginRight: fscale(-10) },
  detailsWrap: { padding: fscale(18) },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: fscale(5) },
  detailKey: { fontSize: fscale(12), color: Colors.textSecondary },
  detailVal: { fontSize: fscale(12), fontWeight: '600', color: Colors.ink, textAlign: 'right', flex: 1, marginLeft: Spacing.sm },
  paidBadge: { marginTop: Spacing.sm, padding: fscale(8), borderRadius: Radii.md, backgroundColor: '#E9F8E4', alignItems: 'center' },
  paidBadgeText: { fontSize: fscale(11.5), fontWeight: '700', color: Colors.green },
  pointsCard: { marginTop: Spacing.md },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pointsIconWrap: { width: fscale(38), height: fscale(38), borderRadius: Radii.md, backgroundColor: Colors.bgLight, alignItems: 'center', justifyContent: 'center' },
  pointsSub: { fontSize: fscale(12.5), color: Colors.textSecondary },
  pointsVal: { fontSize: fscale(15), fontWeight: '700', color: Colors.ink },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: fscale(12), borderRadius: Radii.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: Colors.border },
  shareBtnText: { fontSize: fscale(14), fontWeight: '600', color: Colors.ink },
  homeBtn: { marginTop: Spacing.sm },
});

export default CourierConfirmedScreen;
