import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCButton, NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;
interface PaymentMethod { id: string; name: string; sub: string; icon: IconName; isDefault?: boolean; }

const METHODS: PaymentMethod[] = [
  { id: 'upi',    name: 'NCRide UPI',           sub: 'user@ncrride',          icon: 'upi',    isDefault: true },
  { id: 'card',   name: 'HDFC Infinia •• 4421', sub: 'Credit · Expires 04/29', icon: 'card' },
  { id: 'wallet', name: 'NCRide Wallet',         sub: 'Balance ₹ 2,184.50',    icon: 'wallet' },
  { id: 'cash',   name: 'Cash',                  sub: '',                       icon: 'cash' },
];

const PaymentMethodsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const getSub = (m: PaymentMethod) => {
    if (m.id === 'cash') return t.paymentMethods.cashSub;
    return m.sub;
  };

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}>
        <HeaderBack
          title={t.paymentMethods.title} sub={t.paymentMethods.sub} onBack={() => navigation.goBack()}
          right={<TouchableOpacity style={styles.addBtn} activeOpacity={0.8}><Icon name="plus" size={20} stroke={Colors.ink} /></TouchableOpacity>}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardVisual}>
          <View style={styles.cardGlow} />
          <View style={styles.cardTopRow}>
            <Text style={styles.cardBrand}>NCRide Premier</Text>
            <View style={styles.cardLogo}>
              <View style={[styles.cardLogoCircle, { right: 8 }]} />
              <View style={[styles.cardLogoCircle, { right: 0, backgroundColor: '#F79E1B' }]} />
            </View>
          </View>
          <Text style={styles.cardNumber}>•••• 4421</Text>
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardLabel}>CARDHOLDER</Text>
              <Text style={styles.cardValue}>ARYA SENGUPTA</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>04/29</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ALL METHODS</Text>
        <NCCard pad={0}>
          {METHODS.map((m, i) => (
            <View key={m.id}>
              <View style={styles.methodRow}>
                <View style={styles.methodIconWrap}><Icon name={m.icon} size={18} stroke={Colors.ink} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>{m.name}</Text>
                  <Text style={styles.methodSub}>{getSub(m)}</Text>
                </View>
                {m.isDefault && (
                  <View style={styles.defaultChip}>
                    <Text style={styles.defaultText}>{t.paymentMethods.defaultLabel}</Text>
                  </View>
                )}
              </View>
              {i < METHODS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </NCCard>

        <NCButton label={t.paymentMethods.addCard} icon="plus" onPress={() => {}} variant="ghost" size="lg" style={styles.addMethodBtn} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },
  addBtn: { width: fscale(40), height: fscale(40), borderRadius: Radii.lg, backgroundColor: Colors.bgWhite, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  cardVisual: { backgroundColor: Colors.ink, borderRadius: Radii.xxl, padding: fscale(20), overflow: 'hidden', position: 'relative', marginBottom: Spacing.md },
  cardGlow: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(200,242,96,0.12)' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardBrand: { fontSize: fscale(12), color: 'rgba(255,255,255,0.55)', fontWeight: '700' },
  cardLogo: { width: fscale(40), height: fscale(24), position: 'relative' },
  cardLogoCircle: { position: 'absolute', top: 0, width: fscale(24), height: fscale(24), borderRadius: fscale(12), backgroundColor: '#EB001B', opacity: 0.9 },
  cardNumber: { fontSize: fscale(19), letterSpacing: 4, fontFamily: 'monospace', fontWeight: '700', color: '#fff', marginTop: fscale(22) },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Spacing.md },
  cardLabel: { fontSize: fscale(9.5), color: 'rgba(255,255,255,0.5)', letterSpacing: 0.4 },
  cardValue: { fontSize: fscale(13), fontWeight: '600', color: '#fff', marginTop: 2 },
  sectionLabel: { fontSize: fscale(11), fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: Spacing.sm },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: fscale(14) },
  methodIconWrap: { width: fscale(40), height: fscale(40), borderRadius: Radii.md, backgroundColor: Colors.bgOffWhite, alignItems: 'center', justifyContent: 'center' },
  methodName: { fontSize: fscale(14), fontWeight: '600', color: Colors.ink },
  methodSub: { fontSize: fscale(11.5), color: Colors.textSecondary, marginTop: 1 },
  defaultChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radii.xs, backgroundColor: Colors.lime },
  defaultText: { fontSize: fscale(10), fontWeight: '800', color: Colors.ink },
  divider: { height: 0.5, backgroundColor: 'rgba(15,17,21,0.05)', marginHorizontal: fscale(14) },
  addMethodBtn: { marginTop: Spacing.md },
});

export default PaymentMethodsScreen;
