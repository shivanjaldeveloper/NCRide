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
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPLogin'>;

const OTPLoginScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const isValid = phone.replace(/\s/g, '').length === 10;

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="chevronLeft" size={20} stroke={Colors.ink} sw={2} />
          </TouchableOpacity>

          {/* paddingTop on heading so top matras aren't clipped */}
          <Text style={styles.heading}>{t.auth.welcome}</Text>
          <Text style={styles.subheading}>{t.auth.welcomeSub}</Text>

          <Text style={styles.inputLabel}>{t.auth.mobileNumber}</Text>
          <View style={styles.inputRow}>
            <View style={styles.countryBadge}>
              <Text style={styles.dialCode}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t.auth.phonePlaceholder}
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          <View style={styles.privacyRow}>
            <Icon name="shield" size={17} stroke={Colors.blue} />
            <Text style={styles.privacyText}>{t.auth.privacyNote}</Text>
          </View>

          <View style={{ flex: 1 }} />

          <NCButton
            label={t.auth.sendOtp}
            iconRight="arrowRight"
            onPress={handleSend}
            loading={loading}
            disabled={!isValid}
            variant="primary"
            size="lg"
          />

          <Text style={styles.legal}>
            {t.auth.legalPrefix}
            <Text style={styles.legalLink}>{t.auth.terms}</Text>
            {t.auth.legalMid}
            <Text style={styles.legalLink}>{t.auth.privacy}</Text>
            {t.auth.legalSuffix}
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
    marginBottom: vscale(24),
  },
  heading: {
    fontSize: fscale(28),
    fontWeight: '800',
    // no negative letterSpacing — Devanagari glyphs need space
    letterSpacing: 0,
    color: Colors.ink,
    // paddingTop so top matras (ि ि) aren't clipped by the container
    paddingTop: fscale(6),
    // lineHeight 1.45× keeps matras + descenders visible
    lineHeight: fscale(40),
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: fscale(14),
    color: Colors.textSecondary,
    // 1.6× lineHeight for Devanagari
    lineHeight: fscale(22),
    paddingTop: fscale(2),
    marginBottom: vscale(28),
  },
  inputLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    // room for matras above the label
    paddingTop: fscale(4),
    lineHeight: fscale(18),
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderFocus,
    borderRadius: Radii.lg,
    // taller to accommodate Devanagari ascenders inside input
    height: fscale(56),
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
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(46,125,255,0.06)',
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  privacyText: {
    fontSize: fscale(12.5),
    color: Colors.ink2,
    // 1.6× lineHeight for wrapped Devanagari lines
    lineHeight: fscale(20),
    flex: 1,
    // small paddingTop so first-line matras aren't cut
    paddingTop: fscale(2),
  },
  legal: {
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    // roomy lineHeight for Devanagari legal line
    lineHeight: fscale(20),
  },
  legalLink: { color: Colors.ink, fontWeight: '600' },
});

export default OTPLoginScreen;
