import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCButton, NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'CourierPayment'>;

interface PayMethod { id: string; name: string; icon: IconName; isDefault?: boolean; }

const METHODS: PayMethod[] = [
  { id: 'upi',    name: 'NCRide UPI',           icon: 'upi',    isDefault: true },
  { id: 'card',   name: 'HDFC Infinia •• 4421', icon: 'card' },
  { id: 'wallet', name: 'NCRide Wallet',         icon: 'wallet' },
  { id: 'cash',   name: 'Cash',                  icon: 'cash' },
];

const CourierPaymentScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState('upi');

  const getSub = (id: string) => {
    if (id === 'wallet') return t.payment.walletSub;
    if (id === 'cash')   return t.courier.cashSub;
    if (id === 'upi')    return 'user@ncrride';
    return 'Credit · Expires 04/29';
  };

  return (
    <ScreenShell>
      <HeaderBack title={t.courier.payTitle} sub={t.courier.paySub} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NCCard pad={0}>
          {METHODS.map((p, i) => {
            const active = method === p.id;
            return (
              <TouchableOpacity key={p.id} style={[styles.methodRow, i < METHODS.length - 1 && styles.methodRowBorder]} activeOpacity={0.75} onPress={() => setMethod(p.id)}>
                <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                  <Icon name={p.icon} size={18} stroke={active ? Colors.lime : Colors.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>{p.name}</Text>
                  <Text style={styles.methodSub}>{getSub(p.id)}</Text>
                </View>
                {p.isDefault && !active && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>{t.paymentMethods.defaultLabel}</Text>
                  </View>
                )}
                <View style={[styles.radio, active && styles.radioActive]} />
              </TouchableOpacity>
            );
          })}
        </NCCard>

        <NCCard style={styles.card}>
          <View style={styles.couponRow}>
            <Icon name="coupon" size={18} stroke={Colors.green} />
            <Text style={styles.couponText}>PARCEL25 applied · You saved ₹25</Text>
          </View>
        </NCCard>

        <View style={styles.secureBox}>
          <Icon name="shield" size={16} stroke={Colors.blue} />
          <Text style={styles.secureText}>{t.courier.secureNote}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <NCButton label={t.courier.payBtn} iconRight="check" onPress={() => navigation.navigate('CourierConfirmed')} variant="primary" size="lg" />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(120) },
  card: { marginTop: Spacing.md },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: fscale(14) },
  methodRowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(15,17,21,0.05)' },
  iconWrap: { width: fscale(40), height: fscale(40), borderRadius: Radii.md, backgroundColor: Colors.bgOffWhite, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.ink },
  methodName: { fontSize: fscale(14), fontWeight: '600', color: Colors.ink },
  methodSub: { fontSize: fscale(11.5), color: Colors.textSecondary, marginTop: 1 },
  defaultBadge: { paddingHorizontal: fscale(7), paddingVertical: fscale(3), borderRadius: Radii.xs, backgroundColor: Colors.lime },
  defaultBadgeText: { fontSize: fscale(10), fontWeight: '800', color: Colors.ink },
  radio: { width: fscale(22), height: fscale(22), borderRadius: fscale(11), borderWidth: 1.5, borderColor: Colors.border },
  radioActive: { borderWidth: 6, borderColor: Colors.ink },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  couponText: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },
  secureBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, padding: fscale(10), paddingHorizontal: Spacing.md, backgroundColor: 'rgba(46,125,255,0.06)', borderRadius: Radii.md },
  secureText: { fontSize: fscale(11.5), color: Colors.ink2, flex: 1 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: fscale(30), backgroundColor: 'rgba(244,244,242,0.95)', borderTopWidth: 0.5, borderTopColor: 'rgba(15,17,21,0.06)' },
});

export default CourierPaymentScreen;
