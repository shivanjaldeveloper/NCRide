import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '../layout';
import Icon from './Icon';
import NCButton from './NCButton';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import {
  validateReferralCodeFormat,
  type ReferralValidationResult,
} from '../../utils/referral';

interface Props {
  visible: boolean;
  onClose: () => void;
  // Called only after a successful apply — AccountScreen persists it via
  // utils/referral.ts and refreshes the Row subtitle.
  onApplied: (code: string, discountLabel: string) => void;
  // The user's OWN referral code (from ReferralsScreen) so we can reject
  // self-referral entries — optional since AccountScreen doesn't always
  // have it loaded.
  ownCode?: string;
}

// Flat mock discount awarded on a valid, not-self, not-already-used code.
// Swap this out once a real ApplyReferralCode-style endpoint is confirmed.
const MOCK_DISCOUNT_LABEL = '10% off your next ride';

const ReferralCodeModal = ({ visible, onClose, onApplied, ownCode }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setValue('');
    setSubmitting(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    reset();
    onClose();
  };

  const runValidation = (raw: string): ReferralValidationResult => {
    const code = raw.trim().toUpperCase();
    if (!validateReferralCodeFormat(code))
      return { ok: false, reason: 'invalid' };
    if (ownCode && code === ownCode.toUpperCase()) {
      return { ok: false, reason: 'self' };
    }
    return { ok: true, discountLabel: MOCK_DISCOUNT_LABEL };
  };

  const handleApply = () => {
    const code = value.trim().toUpperCase();
    if (!code) return;
    setError(null);
    setSubmitting(true);
    Keyboard.dismiss();

    // Mocked latency so the loading state is visible — replace this
    // setTimeout with the real API call once an endpoint is confirmed.
    setTimeout(() => {
      const result = runValidation(code);
      setSubmitting(false);
      if (!result.ok) {
        setError(
          result.reason === 'self'
            ? t.referralModal.errorSelf
            : t.referralModal.errorInvalid,
        );
        return;
      }
      setSuccess(true);
      onApplied(code, result.discountLabel);
      setTimeout(handleClose, 1100);
    }, 500);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Sheet
          style={{
            paddingBottom:
              Math.max(insets.bottom, Spacing.lg) +
              (Platform.OS === 'android' ? 28 : 0),
          }}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t.referralModal.title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <Icon name="close" size={20} stroke={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {success ? (
            <View style={styles.successWrap}>
              <View style={styles.successIconWrap}>
                <Icon name="check" size={26} stroke={Colors.green} sw={2.4} />
              </View>
              <Text style={styles.successTitle}>
                {t.referralModal.successTitle}
              </Text>
              <Text style={styles.successSub}>{MOCK_DISCOUNT_LABEL}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sub}>{t.referralModal.sub}</Text>

              <View
                style={[styles.inputWrap, error ? styles.inputWrapError : null]}
              >
                <Icon name="gift" size={18} stroke={Colors.textSecondary} />
                <TextInput
                  value={value}
                  onChangeText={txt => {
                    setValue(txt.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder={t.referralModal.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.input}
                  maxLength={17}
                  editable={!submitting}
                  onSubmitEditing={handleApply}
                  returnKeyType="done"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <NCButton
                label={t.referralModal.applyBtn}
                onPress={handleApply}
                variant="primary"
                size="md"
                disabled={!value.trim()}
                loading={submitting}
                style={{ marginTop: Spacing.md }}
              />
            </>
          )}
        </Sheet>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,17,21,0.45)',
    justifyContent: 'flex-end',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: fscale(18),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: fscale(13),
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    height: fscale(52),
  },
  inputWrapError: { borderColor: Colors.red },
  input: {
    flex: 1,
    fontSize: fscale(16),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: fscale(12),
    color: Colors.red,
    marginTop: Spacing.sm,
  },
  successWrap: { alignItems: 'center', paddingVertical: Spacing.lg },
  successIconWrap: {
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: fscale(16),
    fontWeight: '700',
    color: Colors.ink,
  },
  successSub: {
    fontSize: fscale(13),
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default ReferralCodeModal;
