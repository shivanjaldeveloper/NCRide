import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
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

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerify'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 42;

const OTPVerifyScreen = ({ navigation, route }: Props) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) return;
    Keyboard.dismiss();
    setLoading(true);
    // TODO: call your OTP verify API here
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    navigation.replace('LocationPermission');
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtp('');
    setCountdown(RESEND_SECONDS);
    // TODO: call resend OTP API
  };

  // Format countdown as MM:SS
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  return (
    <ScreenShell
      topColor={Colors.bgWhite}
      bottomColor={Colors.bgWhite}
      backgroundColor={Colors.bgWhite}>
      <View style={styles.container}>

        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        {/* Code sent badge */}
        <View style={styles.sentBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.sentText}>Code sent to +91 {phone}</Text>
        </View>

        <Text style={styles.heading}>Enter the code</Text>
        <View style={styles.subRow}>
          <Text style={styles.subText}>6-digit OTP · </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changeLink}>Change number</Text>
          </TouchableOpacity>
        </View>

        {/* Hidden real input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={v => setOtp(v.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
        />

        {/* Visual boxes */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.boxRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const char = otp[i];
            const isFilled = !!char;
            const isCurrent = i === otp.length;
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  isFilled && styles.boxFilled,
                  isCurrent && styles.boxCurrent,
                ]}>
                {isFilled ? (
                  <Text style={styles.digit}>{char}</Text>
                ) : (
                  <View style={styles.dash} />
                )}
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
          <Text style={styles.resend}>
            {countdown > 0
              ? `Resend code in ${mm}:${ss}`
              : 'Resend code'}
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <NCButton
          label="Verify & continue →"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length < OTP_LENGTH}
        />

        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink}>Terms</Text>
          {' & '}
          <Text style={styles.legalLink}>Privacy policy</Text>.
        </Text>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: vscale(20),
  },
  backIcon: { fontSize: fscale(22), color: Colors.textPrimary, marginTop: -2 },

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
  sentText: { ...Typography.bodySmall, color: Colors.textSecondary },

  heading: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.xs },
  subRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vscale(28) },
  subText: { ...Typography.bodySmall, color: Colors.textSecondary },
  changeLink: { ...Typography.bodySmall, color: Colors.blue },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  boxRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: vscale(12),
  },
  box: {
    width: fscale(46),
    height: fscale(54),
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { backgroundColor: Colors.primary },
  boxCurrent: { backgroundColor: '#2C2C2E' },
  digit: {
    ...Typography.h2,
    color: Colors.accent,
  },
  dash: {
    width: fscale(14),
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },

  resend: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: vscale(16),
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

export default OTPVerifyScreen;
