import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPLogin'>;

const OTPLoginScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const isValid = phone.replace(/\s/g, '').length === 10;

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    // TODO: call your OTP send API here
    await new Promise(r => setTimeout(r, 800)); // simulated delay
    setLoading(false);
    navigation.navigate('OTPVerify', { phone });
  };

  return (
    <ScreenShell
      topColor={Colors.bgWhite}
      bottomColor={Colors.bgWhite}
      backgroundColor={Colors.bgWhite}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="chevronLeft" size={20} stroke={Colors.ink} sw={2} />
          </TouchableOpacity>

          {/* Heading */}
          <Text style={styles.heading}>{'Welcome.\nSign in to NCRide'}</Text>
          <Text style={styles.subheading}>
            We'll send a 6-digit OTP to verify your number.
          </Text>

          {/* Phone input */}
          <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
          <View style={styles.inputRow}>
            <View style={styles.countryBadge}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.dialCode}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="98300 12428"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={10} // 10 digits + optional space
              autoFocus
            />
          </View>

          {/* Privacy note */}
          <View style={styles.privacyRow}>
            <Icon name="shield" size={17} stroke={Colors.blue} />
            <Text style={styles.privacyText}>
              Your number is encrypted and never shared with drivers.
            </Text>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* CTA */}
          <NCButton
            label="Send OTP"
            iconRight="arrowRight"
            onPress={handleSend}
            loading={loading}
            disabled={!isValid}
            variant="primary"
            size="lg"
          />

          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.legalLink}>Terms</Text>
            {' & '}
            <Text style={styles.legalLink}>Privacy policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screen,
    paddingBottom: vscale(32),
  },

  backBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vscale(20),
    marginBottom: vscale(28),
  },

  heading: {
    fontSize: fscale(30),
    fontWeight: '800',
    letterSpacing: -1,
    color: Colors.ink,
    lineHeight: fscale(33),
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: fscale(14),
    color: Colors.textSecondary,
    lineHeight: fscale(20),
    marginBottom: vscale(32),
  },

  inputLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderFocus,
    borderRadius: Radii.lg,
    height: fscale(54),
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.inputBg,
    marginBottom: Spacing.md,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  flag: { fontSize: fscale(20) },
  dialCode: { fontSize: fscale(15), fontWeight: '700', color: Colors.ink },
  divider: {
    width: 1,
    height: fscale(22),
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fscale(18),
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.ink,
    padding: 0,
  },

  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(46,125,255,0.06)',
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  privacyText: {
    fontSize: fscale(12.5),
    color: Colors.ink2,
    lineHeight: fscale(17.5),
    flex: 1,
  },

  legal: {
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: fscale(17.8),
  },
  legalLink: {
    color: Colors.ink,
    fontWeight: '600',
  },
});

export default OTPLoginScreen;
