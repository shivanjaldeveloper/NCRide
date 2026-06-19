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
import { NCButton } from '../../components/common';
import {
  Colors,
  Typography,
  Spacing,
  fscale,
  vscale,
  Radii,
} from '../../theme';

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
      backgroundColor={Colors.bgWhite}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
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
              maxLength={11}   // 10 digits + optional space
              autoFocus
            />
          </View>

          {/* Privacy note */}
          <View style={styles.privacyRow}>
            <View style={styles.privacyDot} />
            <Text style={styles.privacyText}>
              Your number is encrypted and never shared with drivers.
            </Text>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* CTA */}
          <NCButton
            label="Send OTP →"
            onPress={handleSend}
            loading={loading}
            disabled={!isValid}
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
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vscale(12),
    marginBottom: vscale(28),
  },
  backIcon: { fontSize: fscale(22), color: Colors.textPrimary, marginTop: -2 },

  heading: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subheading: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: vscale(32),
  },

  inputLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderFocus,
    borderRadius: Radii.md,
    height: fscale(52),
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.inputBg,
    marginBottom: Spacing.md,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  flag: { fontSize: fscale(16) },
  dialCode: { ...Typography.h4, color: Colors.textPrimary },
  divider: {
    width: 1,
    height: fscale(20),
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.h4,
    color: Colors.textPrimary,
    padding: 0,
  },

  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#EEF4FF',
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  privacyDot: {
    width: fscale(8),
    height: fscale(8),
    borderRadius: fscale(4),
    backgroundColor: Colors.blue,
    marginTop: fscale(4),
  },
  privacyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },

  legal: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  legalLink: {
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
});

export default OTPLoginScreen;
