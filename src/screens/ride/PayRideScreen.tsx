import React, { useState } from 'react';
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
import { NCButton, NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PayRide'>;

interface PaymentMethod {
  id: string;
  name: string;
  sub: string;
  icon: IconName;
}

// Ported from the reference's PAYMENT_METHODS — trimmed to the four entries
// that have a matching icon in this RN port (the reference itself falls
// back to 'upi' for any method whose icon isn't card/cash/wallet).
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'upi', name: 'NCRide UPI', sub: 'user@ncrride', icon: 'upi' },
  {
    id: 'card',
    name: 'HDFC Infinia •• 4421',
    sub: 'Credit · Expires 04/29',
    icon: 'card',
  },
  {
    id: 'wallet',
    name: 'NCRide Wallet',
    sub: 'Balance ₹ 2,184.50',
    icon: 'wallet',
  },
  { id: 'cash', name: 'Cash', sub: 'Pay driver directly', icon: 'cash' },
];

const PayRideScreen = ({ navigation }: Props) => {
  const [method, setMethod] = useState('upi');

  return (
    <ScreenShell>
      <HeaderBack
        title="Choose payment"
        sub="Pay ₹ 184.00 for NR-N22-78421"
        onBack={() => navigation.navigate('Invoice')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NCCard pad={0}>
          {PAYMENT_METHODS.map((p, i) => {
            const active = method === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.methodRow,
                  i < PAYMENT_METHODS.length - 1 && styles.methodRowBorder,
                ]}
                activeOpacity={0.75}
                onPress={() => setMethod(p.id)}
              >
                <View
                  style={[
                    styles.methodIconWrap,
                    active && styles.methodIconWrapActive,
                  ]}
                >
                  <Icon
                    name={p.icon}
                    size={18}
                    stroke={active ? Colors.lime : Colors.ink}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>{p.name}</Text>
                  <Text style={styles.methodSub}>{p.sub}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]} />
              </TouchableOpacity>
            );
          })}
        </NCCard>

        <NCCard style={styles.card}>
          <View style={styles.couponRow}>
            <Icon name="coupon" size={18} stroke={Colors.green} />
            <Text style={styles.couponText}>
              NCR50 applied · You saved ₹19.61
            </Text>
          </View>
        </NCCard>

        <View style={styles.secureRow}>
          <Icon name="shield" size={16} stroke={Colors.blue} />
          <Text style={styles.secureText}>
            Payments are end-to-end encrypted · PCI-DSS L1
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <NCButton
          label="Pay ₹ 184.00 securely"
          iconRight="check"
          onPress={() => navigation.navigate('Receipt')}
          variant="primary"
          size="lg"
        />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(100) },
  card: { marginTop: Spacing.md },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: fscale(14),
  },
  methodRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(15,17,21,0.05)',
  },
  methodIconWrap: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconWrapActive: { backgroundColor: Colors.ink },
  methodName: { fontSize: fscale(14), fontWeight: '600', color: Colors.ink },
  methodSub: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  radio: {
    width: fscale(22),
    height: fscale(22),
    borderRadius: fscale(11),
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  radioActive: {
    borderWidth: 6,
    borderColor: Colors.ink,
  },

  couponRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  couponText: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: fscale(10),
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(46,125,255,0.06)',
    borderRadius: Radii.md,
  },
  secureText: { fontSize: fscale(11.5), color: Colors.ink2, flex: 1 },

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

export default PayRideScreen;
