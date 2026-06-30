import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, NCCard, Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Receipt'>;

const RECEIPT_VALUES = [
  'Sector 62, Noida → Connaught Place',
  '18 Mar 2026 · 4:42 PM',
  'Rajat Kr. Saha',
  'Auto Rickshaw · DL 5C NC 4421',
  '9.4 km · 24 min',
  'UPI · arya@ncrride',
];

const QRPattern = () => {
  const cells = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < 64; i++) {
      if ((i * 7 + 3) % 3 === 0) continue;
      out.push({ x: (i % 8) * 7 + 3, y: Math.floor(i / 8) * 7 + 3 });
    }
    return out;
  }, []);
  return (
    <Svg width={48} height={48} viewBox="0 0 60 60">
      {cells.map((c, i) => <Rect key={i} x={c.x} y={c.y} width={6} height={6} fill={Colors.ink} />)}
    </Svg>
  );
};

const ReceiptScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successWrap}>
          <View style={styles.checkCircle}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12 L10 17 L20 7" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={styles.successTitle}>{t.receipt.successTitle}</Text>
          <Text style={styles.successSub}>{t.receipt.successSub}</Text>
        </View>

        <NCCard pad={0} style={styles.card}>
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.label}>{t.receipt.receiptLabel}</Text>
              <Text style={styles.receiptId}>NR-N22-78421</Text>
            </View>
            <QRPattern />
          </View>
          <View style={styles.perforation}>
            <View style={styles.perfLine} />
            <View style={[styles.perfNotch, styles.perfNotchLeft]} />
            <View style={[styles.perfNotch, styles.perfNotchRight]} />
          </View>
          <View style={styles.receiptBody}>
            {t.receipt.keys.map((k, i) => (
              <View key={k} style={styles.receiptRow}>
                <Text style={styles.receiptKey}>{k}</Text>
                <Text style={styles.receiptVal}>{RECEIPT_VALUES[i]}</Text>
              </View>
            ))}
            <View style={styles.paidDivider}>
              <Text style={styles.paidLabel}>{t.receipt.paidLabel}</Text>
              <Text style={styles.paidAmount}>₹ 184.00</Text>
            </View>
          </View>
        </NCCard>

        <View style={styles.rewardCard}>
          <View style={styles.rewardIconWrap}><Icon name="reward" size={20} stroke={Colors.lime} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rewardLabel}>{t.receipt.youEarned}</Text>
            <Text style={styles.rewardValue}>{t.receipt.points}</Text>
          </View>
          <Icon name="chevron" size={18} stroke="rgba(255,255,255,0.6)" />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
          <Icon name="link" size={18} stroke={Colors.ink} />
          <Text style={styles.shareText}>{t.receipt.share}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <NCButton label={t.receipt.done} onPress={() => navigation.navigate('HomeTabs')} variant="primary" size="lg" />
        </View>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingTop: fscale(28), paddingBottom: fscale(100) },
  successWrap: { alignItems: 'center' },
  checkCircle: { width: fscale(72), height: fscale(72), borderRadius: fscale(36), backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.green, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 30, elevation: 10 },
  successTitle: { marginTop: Spacing.md, fontSize: fscale(24), fontWeight: '700', color: Colors.ink, letterSpacing: -0.6 },
  successSub: { fontSize: fscale(13.5), color: Colors.textSecondary, marginTop: 4 },
  card: { marginTop: fscale(22) },
  receiptHeader: { padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: fscale(11), fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase' },
  receiptId: { fontSize: fscale(16), fontWeight: '700', color: Colors.ink, fontFamily: 'monospace', marginTop: 2 },
  perforation: { height: 20, position: 'relative' },
  perfLine: { position: 'absolute', left: 16, right: 16, top: 9, borderTopWidth: 1.5, borderTopColor: 'rgba(15,17,21,0.15)', borderStyle: 'dashed' },
  perfNotch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.bgOffWhite },
  perfNotchLeft: { left: -10 },
  perfNotchRight: { right: -10 },
  receiptBody: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingTop: 4 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  receiptKey: { fontSize: fscale(12.5), color: Colors.textSecondary },
  receiptVal: { fontSize: fscale(12.5), color: Colors.ink, fontWeight: '600', textAlign: 'right', flex: 1, paddingLeft: Spacing.sm },
  paidDivider: { borderTopWidth: 0.5, borderTopColor: Colors.border, marginTop: Spacing.xs, paddingTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  paidLabel: { fontSize: fscale(13), fontWeight: '700', color: Colors.ink },
  paidAmount: { fontSize: fscale(18), fontWeight: '800', color: Colors.green, letterSpacing: -0.4 },
  rewardCard: { marginTop: Spacing.md, backgroundColor: Colors.ink, borderRadius: Radii.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rewardIconWrap: { width: fscale(38), height: fscale(38), borderRadius: Radii.md, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  rewardLabel: { fontSize: fscale(12.5), color: 'rgba(255,255,255,0.6)' },
  rewardValue: { fontSize: fscale(15), fontWeight: '700', color: '#fff', marginTop: 1 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: fscale(30), backgroundColor: 'rgba(244,244,242,0.95)', borderTopWidth: 0.5, borderTopColor: Colors.borderSoft, flexDirection: 'row', gap: Spacing.sm },
  shareBtn: { height: fscale(56), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: Spacing.lg, borderRadius: Radii.xl, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 0.5, borderColor: Colors.border },
  shareText: { fontSize: fscale(14), fontWeight: '600', color: Colors.ink },
});

export default ReceiptScreen;
