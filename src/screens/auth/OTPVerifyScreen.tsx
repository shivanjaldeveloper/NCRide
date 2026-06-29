import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerify'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 42;

const locationPermission =
  Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

const OTPVerifyScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { phone } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const otpString = otp.join('');

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    if (otpString.length < OTP_LENGTH) return;
    Keyboard.dismiss();
    setLoading(true);
    // Run the (fake) verify delay and the permission check in parallel,
    // so the permission check adds no extra wait time on top of verify.
    const [, permissionStatus] = await Promise.all([
      new Promise(r => setTimeout(r, 900)),
      check(locationPermission).catch(() => null),
    ]);
    setLoading(false);

    const alreadyGranted =
      permissionStatus === RESULTS.GRANTED ||
      permissionStatus === RESULTS.LIMITED;

    navigation.replace(alreadyGranted ? 'HomeTabs' : 'LocationPermission');
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  };

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

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
          keyboardShouldPersistTaps="always"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="chevronLeft" size={20} stroke={Colors.ink} sw={2} />
          </TouchableOpacity>

          <View style={styles.sentBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.sentText}>
              {t.auth.codeSentTo}
              {phone}
            </Text>
          </View>

          <Text style={styles.heading}>{t.auth.enterCode}</Text>
          <View style={styles.subRow}>
            <Text style={styles.subText}>{t.auth.otpSubLabel}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.changeLink}>{t.auth.changeNumber}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.boxRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <TextInput
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                style={[styles.box, otp[i] ? styles.boxFilled : null]}
                value={otp[i]}
                onChangeText={text => handleChange(text, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                autoFocus={i === 0}
                caretHidden
                selectTextOnFocus
                placeholder="—"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text style={styles.resend}>
              {countdown > 0 ? (
                <>
                  {t.auth.resendIn}
                  <Text style={styles.resendStrong}>
                    {mm}:{ss}
                  </Text>
                </>
              ) : (
                t.auth.resendCode
              )}
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <NCButton
            label={t.auth.verifyContinue}
            iconRight="arrowRight"
            onPress={handleVerify}
            loading={loading}
            disabled={otpString.length < OTP_LENGTH}
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
    marginBottom: vscale(20),
  },
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  greenDot: {
    width: fscale(8),
    height: fscale(8),
    borderRadius: fscale(4),
    backgroundColor: Colors.green,
  },
  sentText: { fontSize: fscale(12), fontWeight: '700', color: Colors.green },
  heading: {
    fontSize: fscale(30),
    fontWeight: '800',
    letterSpacing: -1,
    color: Colors.ink,
    lineHeight: fscale(33),
    marginBottom: Spacing.xs,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vscale(32),
  },
  subText: { fontSize: fscale(14), color: Colors.textSecondary },
  changeLink: { fontSize: fscale(14), fontWeight: '600', color: Colors.blue },
  boxRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: vscale(14) },
  box: {
    flex: 1,
    height: fscale(62),
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
    borderWidth: 2,
    borderColor: Colors.ink,
    fontSize: fscale(26),
    fontWeight: '800',
    color: Colors.lime,
  },
  boxFilled: { backgroundColor: Colors.ink },
  resend: {
    fontSize: fscale(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: vscale(16),
  },
  resendStrong: { color: Colors.ink, fontWeight: '700' },
  legal: {
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: fscale(17.8),
  },
  legalLink: { color: Colors.ink, fontWeight: '600' },
});

export default OTPVerifyScreen;
