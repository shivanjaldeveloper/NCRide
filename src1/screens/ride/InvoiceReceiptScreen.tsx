import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCButton, NCCard } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoiceReceipt'>;

const FARE_LINES: [string, string][] = [
  ['Base fare', '₹ 45.00'],
  ['Distance · 9.4 km × ₹22', '₹ 206.80'],
  ['Platform fee', '₹ 5.00'],
  ['GST · 5%', '₹ 12.84'],
];

const InvoiceReceiptScreen = ({ navigation }: Props) => {
  return (
    <ScreenShell>
      <HeaderBack
        title="Invoice"
        sub="NR-N22-78421"
        onBack={() => navigation.navigate('HomeTabs')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NCCard pad={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.label}>TAX INVOICE</Text>
              <Text style={styles.invoiceId}>NR/RD/2426/78421</Text>
            </View>
            <Svg width={38} height={38} viewBox="0 0 38 38">
              <Rect width={38} height={38} rx={10} fill={Colors.ink} />
              <SvgText
                x={19}
                y={25}
                textAnchor="middle"
                fill={Colors.lime}
                fontSize={10}
                fontWeight="800"
              >
                NCR
              </SvgText>
            </Svg>
          </View>

          <View style={styles.body}>
            <Text style={styles.sectionLabel}>SERVICE</Text>
            <Text style={styles.serviceTitle}>
              Sector 62, Noida → Connaught Place
            </Text>
            <Text style={styles.serviceMeta}>
              18 Mar · Auto Rickshaw · 9.4 km · 24 min
            </Text>

            <Text style={[styles.sectionLabel, styles.spaced]}>RIDER</Text>
            <Text style={styles.riderText}>
              Arya Sengupta · arya@ncrride.com
            </Text>

            <Text style={[styles.sectionLabel, styles.spaced]}>
              FARE BREAKUP
            </Text>
            {FARE_LINES.map(([k, v]) => (
              <View key={k} style={styles.fareRow}>
                <Text style={styles.fareKey}>{k}</Text>
                <Text style={styles.fareVal}>{v}</Text>
              </View>
            ))}
            <View style={styles.fareRow}>
              <Text style={[styles.fareKey, styles.green]}>NCR50 applied</Text>
              <Text style={[styles.fareVal, styles.green]}>-₹ 85.64</Text>
            </View>

            <View style={styles.totalDivider}>
              <Text style={styles.totalLabel}>Total paid</Text>
              <Text style={styles.totalValue}>₹ 284.00</Text>
            </View>

            <View style={styles.paidBanner}>
              <Text style={styles.paidBannerText}>
                PAID · UPI · arya@ncrride · 18 Mar 17:08
              </Text>
            </View>
          </View>
        </NCCard>

        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <NCButton
              label="Share"
              icon="link"
              onPress={() => {}}
              variant="glass"
              size="md"
            />
          </View>
          <View style={{ flex: 1 }}>
            <NCButton
              label="Download PDF"
              icon="receipt"
              onPress={() => {}}
              variant="primary"
              size="md"
            />
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(60) },

  header: {
    padding: Spacing.lg,
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
  },
  invoiceId: {
    fontSize: fscale(14),
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 2,
  },

  body: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(15,17,21,0.12)',
    borderStyle: 'dashed',
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  spaced: { marginTop: Spacing.md },
  serviceTitle: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  serviceMeta: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  riderText: { fontSize: fscale(13.5), fontWeight: '600', color: Colors.ink },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  fareKey: { fontSize: fscale(13), color: Colors.textSecondary },
  fareVal: { fontSize: fscale(13), color: Colors.ink, fontWeight: '600' },
  green: { color: Colors.green },

  totalDivider: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    marginTop: 6,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  totalValue: {
    fontSize: fscale(18),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.4,
  },

  paidBanner: {
    marginTop: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#E9F8E4',
    borderRadius: Radii.sm,
  },
  paidBannerText: {
    textAlign: 'center',
    color: Colors.green,
    fontSize: fscale(11.5),
    fontWeight: '700',
  },

  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});

export default InvoiceReceiptScreen;
