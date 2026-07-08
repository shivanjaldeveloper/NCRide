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
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { setLoggedIn, setSession } from '../../utils/auth';
import { checkFullLocationStatus } from '../../utils/location';
import {
  verifyOtp,
  resendOtp,
  AuthApiError,
  isAuthApiError,
} from '../../services/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerify'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 42;

// TEMP: backend currently accepts a fixed test OTP regardless of what was
// actually sent to the phone. We no longer auto-fill the boxes (so the
// normal typing/validation flow gets exercised), but we still show a hint
// so testers know what to type. Set SHOW_TEST_OTP_HINT to false once the
// backend sends real, per-request OTPs via SMS.
const TEST_OTP = '123456';
const SHOW_TEST_OTP_HINT = true;

// TEMP: shows the exact request/response (or thrown error) on a failed
// verify, regardless of __DEV__ — turn this off once the live API
// integration is confirmed stable, since it'll otherwise leak backend
// response shapes to end users on a release build.
const SHOW_VERBOSE_ERRORS = true;

const OTPVerifyScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { phone } = route.params;
  // The transaction id changes every time VerifyNumber is called (initial
  // send + every resend), so it's kept in state rather than destructured
  // once from route.params.
  const [otpTransaction, setOtpTransaction] = useState(
    route.params.otpTransaction,
  );
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Native-stack quirk: if 'OTPVerify' is already sitting in the stack (e.g.
  // user went Back to OTPLogin and hit Send OTP again), navigation.navigate()
  // reuses this *same mounted instance* and just merges in new route.params
  // — it does NOT remount the screen. Since the otpTransaction state above
  // only reads route.params.otpTransaction once (on mount), it would
  // otherwise stay pinned to the very first transaction id forever, causing
  // every subsequent verify to fail with "Invalid OTP" even after a fresh
  // OTP was actually sent. This effect re-syncs local state any time the
  // incoming otpTransaction param actually changes.
  useEffect(() => {
    setOtpTransaction(route.params.otpTransaction);
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  }, [route.params.otpTransaction]);

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

  // Shared "where do we go next" logic used both for existing users and
  // right after a brand-new user finishes the registration screen.
  const routeAfterLogin = async () => {
    // Persist auth state so splash routes correctly on next launch
    try {
      await setLoggedIn();
    } catch (e) {
      throw new Error(
        `[step:setLoggedIn] ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    // Route based on whether BOTH permission AND GPS are already good.
    // Only skip LocationPermission screen when both are true — permission
    // alone isn't enough, otherwise a user with GPS off would land on
    // Home and immediately hit the blocking guard there.
    let locStatus;
    try {
      locStatus = await checkFullLocationStatus();
    } catch (e) {
      throw new Error(
        `[step:checkFullLocationStatus] ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }
    try {
      if (locStatus.allGood) {
        navigation.replace('HomeTabs');
      } else {
        navigation.replace('LocationPermission');
      }
    } catch (e) {
      throw new Error(
        `[step:navigation.replace] ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }
  };

  const handleVerify = async () => {
    if (otpString.length < OTP_LENGTH || loading) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const res = await verifyOtp(otpTransaction, otpString);

      // Persist the session (cookie/username/name) returned by the server.
      try {
        await setSession(res.Cookie, res.Username, res.Name);
      } catch (e) {
        throw new Error(
          `[step:setSession] ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      if (!res.Name || res.Name.trim().length === 0) {
        // Empty Name on file -> brand-new user, collect basic details
        // before letting them into the app.
        navigation.replace('Registration', {
          phone,
          username: res.Username,
        });
        return;
      }

      await routeAfterLogin();
    } catch (err) {
      // TEMP: always show full debug details (not gated behind __DEV__) while
      // we're actively wiring up the live API — on a release/APK build
      // __DEV__ is false, which was hiding every diagnostic line and made
      // every failure look like a bare "Something went wrong." Re-add the
      // __DEV__ gate (see SHOW_VERBOSE_ERRORS below) once the integration is
      // confirmed stable end-to-end.
      if (isAuthApiError(err)) {
        if (SHOW_VERBOSE_ERRORS) {
          Alert.alert(
            'Verification failed',
            [
              err.message,
              '',
              `Sent: ${err.requestBody ?? '(no request body captured)'}`,
              err.responseStatus != null
                ? `HTTP status: ${err.responseStatus}`
                : null,
              err.responseBody != null
                ? `Server response: ${JSON.stringify(err.responseBody)}`
                : null,
            ]
              .filter(Boolean)
              .join('\n'),
          );
        } else {
          Alert.alert('Verification failed', err.message);
        }
      } else {
        Alert.alert(
          'Verification failed',
          `Something went wrong. Please try again.${
            SHOW_VERBOSE_ERRORS
              ? `\n\n${
                  err instanceof Error
                    ? `${err.name}: ${err.message}`
                    : `Non-Error thrown: ${JSON.stringify(err)}`
                }`
              : ''
          }`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      // Resend against the CURRENT transaction — the server issues a new
      // one in response, which invalidates the old one for VerifyOtp.
      const res = await resendOtp(otpTransaction);
      setOtpTransaction(res.OtpTransaction);
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message = isAuthApiError(err)
        ? err.message
        : 'Something went wrong. Please try again.';
      Alert.alert('Could not resend OTP', message);
    } finally {
      setResending(false);
    }
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

          {SHOW_TEST_OTP_HINT && (
            <Text style={styles.testHint}>Test mode · OTP is {TEST_OTP}</Text>
          )}

          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0 || resending}
          >
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
    paddingTop: fscale(4),
  },
  greenDot: {
    width: fscale(8),
    height: fscale(8),
    borderRadius: fscale(4),
    backgroundColor: Colors.green,
    flexShrink: 0,
  },
  sentText: {
    fontSize: fscale(12),
    fontWeight: '700',
    color: Colors.green,
    lineHeight: fscale(18),
  },
  heading: {
    fontSize: fscale(28),
    fontWeight: '800',
    letterSpacing: 0,
    color: Colors.ink,
    paddingTop: fscale(6),
    lineHeight: fscale(40),
    marginBottom: Spacing.xs,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: fscale(4),
    marginBottom: vscale(28),
    paddingTop: fscale(4),
  },
  subText: {
    fontSize: fscale(14),
    color: Colors.textSecondary,
    lineHeight: fscale(22),
  },
  changeLink: {
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.blue,
    lineHeight: fscale(22),
  },
  boxRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: vscale(14),
    paddingTop: fscale(2),
  },
  box: {
    flex: 1,
    height: fscale(64),
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
    borderWidth: 2,
    borderColor: Colors.ink,
    fontSize: fscale(26),
    fontWeight: '800',
    color: Colors.lime,
  },
  boxFilled: { backgroundColor: Colors.ink },
  testHint: {
    fontSize: fscale(12),
    fontWeight: '600',
    color: Colors.amber,
    textAlign: 'center',
    marginBottom: vscale(10),
  },
  resend: {
    fontSize: fscale(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: vscale(16),
    paddingTop: fscale(4),
    lineHeight: fscale(22),
  },
  resendStrong: { color: Colors.ink, fontWeight: '700' },
  legal: {
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: fscale(20),
    paddingTop: fscale(2),
  },
  legalLink: { color: Colors.ink, fontWeight: '600' },
});

export default OTPVerifyScreen;
