import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
  updateUserProfile,
  verifyCookie,
  isAuthApiError,
} from '../../services/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegistrationScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { phone, cookie } = route.params;

  const [name, setNameField] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    EMAIL_RE.test(email.trim());

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      // Step: API: UpdateProfile
      await updateUserProfile(cookie, trimmedName, trimmedEmail);

      // Step: API: VerifyCookie (re-check right after updating, per the
      // auth flow diagram) — also picks up any rotated cookie and confirms
      // the update actually stuck server-side before we treat it as done.
      const cookieRes = await verifyCookie(cookie);

      await setSession(
        cookieRes.Cookie,
        cookieRes.Username,
        cookieRes.Name || trimmedName,
        cookieRes.Email || trimmedEmail,
      );
      await setLoggedIn();

      const locStatus = await checkFullLocationStatus();
      if (locStatus.allGood) {
        navigation.replace('HomeTabs');
      } else {
        navigation.replace('LocationPermission');
      }
    } catch (err) {
      const message = isAuthApiError(err)
        ? err.message
        : 'We could not save your details. Please try again.';
      Alert.alert('Something went wrong', message);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.heading}>{t.registration.heading}</Text>
          <Text style={styles.subheading}>{t.registration.subheading}</Text>

          <Text style={styles.inputLabel}>{t.registration.nameLabel}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setNameField}
            placeholder={t.registration.namePlaceholder}
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
            autoFocus
            returnKeyType="next"
          />

          <Text style={styles.inputLabel}>{t.registration.emailLabel}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t.registration.emailPlaceholder}
            placeholderTextColor={Colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />

          <Text style={styles.inputLabel}>{t.registration.mobileLabel}</Text>
          <TouchableOpacity
            style={[styles.input, styles.inputDisabled]}
            disabled
          >
            <Text style={styles.mobileText}>+91 {phone}</Text>
          </TouchableOpacity>

          <Text style={styles.helper}>{t.registration.helper}</Text>

          <Text style={{ flex: 1 }} />

          <NCButton
            label={t.registration.continueBtn}
            iconRight="arrowRight"
            onPress={handleContinue}
            loading={loading}
            disabled={!isValid}
            variant="primary"
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: vscale(28),
    paddingBottom: vscale(32),
  },
  heading: {
    fontSize: fscale(28),
    fontWeight: '800',
    letterSpacing: 0,
    color: Colors.ink,
    paddingTop: fscale(6),
    lineHeight: fscale(40),
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: fscale(14),
    color: Colors.textSecondary,
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
    paddingTop: fscale(4),
    lineHeight: fscale(18),
    marginBottom: Spacing.sm,
  },
  input: {
    height: fscale(56),
    borderWidth: 1.5,
    borderColor: Colors.borderFocus,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.inputBg,
    fontSize: fscale(16),
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.md,
    justifyContent: 'center',
  },
  inputDisabled: {
    backgroundColor: Colors.bgLight,
    borderColor: Colors.border,
  },
  mobileText: {
    fontSize: fscale(16),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  helper: {
    fontSize: fscale(12.5),
    color: Colors.textTertiary,
    lineHeight: fscale(20),
    marginTop: fscale(-4),
    marginBottom: Spacing.md,
  },
});

export default RegistrationScreen;
