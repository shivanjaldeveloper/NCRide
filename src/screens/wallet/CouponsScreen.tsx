import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCCard, Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Coupons'>;

interface Coupon {
  code: string;
  off: string;
  desc: string;
}

// Ported from the reference's COUPONS dataset, trimmed to ride/courier-relevant
// offers (this app only books Auto, E-Rickshaw and Courier).
const COUPONS: Coupon[] = [
  {
    code: 'NCR50',
    off: '50% off · upto ₹150',
    desc: 'On rides within Noida & NCR',
  },
  { code: 'FIRSTRIDE', off: '₹200 off', desc: 'First booking on NCRide' },
  { code: 'WEEKENDRIDE', off: '25% off', desc: 'Sat & Sun rides' },
  { code: 'PARCEL25', off: '25% off', desc: 'Same-day courier' },
  { code: 'AUTO20', off: '20% off · upto ₹50', desc: 'On Auto rides' },
  { code: 'ERICK15', off: '15% off', desc: 'On E-Rickshaw rides' },
];

const CouponsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack
          title={t.coupons.title}
          sub={`${COUPONS.length} available`}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {COUPONS.map(c => (
          <NCCard key={c.code} pad={0} style={styles.couponCard}>
            <View style={styles.stub}>
              <Icon name="coupon" size={22} stroke={Colors.lime} />
              <Text style={styles.stubLabel}>NCRide</Text>
              <View style={styles.perfDots}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={styles.perfDot} />
                ))}
              </View>
            </View>
            <View style={styles.couponBody}>
              <Text style={styles.code}>{c.code}</Text>
              <Text style={styles.off}>{c.off}</Text>
              <Text style={styles.desc}>{c.desc}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.validity}>{t.coupons.expiryPrefix} 30 Apr 2026</Text>
                <TouchableOpacity style={styles.copyBtn} activeOpacity={0.8}>
                  <Text style={styles.copyText}>{t.common.apply}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </NCCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: fscale(40),
    gap: Spacing.sm,
  },

  couponCard: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  stub: {
    width: fscale(86),
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
    position: 'relative',
  },
  stubLabel: {
    fontSize: fscale(9.5),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.4,
  },
  perfDots: {
    position: 'absolute',
    right: -3,
    top: '50%',
    transform: [{ translateY: -42 }],
    gap: 6,
  },
  perfDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bgOffWhite,
  },
  couponBody: {
    flex: 1,
    padding: Spacing.md,
    paddingLeft: fscale(18),
  },
  code: {
    fontSize: fscale(15),
    fontWeight: '800',
    color: Colors.ink,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  off: {
    fontSize: fscale(13),
    fontWeight: '700',
    color: Colors.green,
    marginTop: 2,
  },
  desc: { fontSize: fscale(11), color: Colors.textSecondary, marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  validity: {
    fontSize: fscale(10),
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgOffWhite,
  },
  copyText: { fontSize: fscale(11), fontWeight: '800', color: Colors.ink },
});

export default CouponsScreen;
