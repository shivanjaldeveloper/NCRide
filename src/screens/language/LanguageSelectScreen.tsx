import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, fscale, vscale, Radii, Shadows } from '../../theme';
import { LANGUAGE_OPTIONS, type Locale } from '../../i18n/translations';
import { useTranslation } from '../../i18n';
import { NCButton } from '../../components/common';
import { ScreenShell } from '../../components/layout';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

const LanguageSelectScreen = ({ navigation }: Props) => {
  const { t, locale, setLocale } = useTranslation();
  const [selected, setSelected] = useState<Locale>(locale);

  // Can we go back? (came from Account) or is this first launch (no back stack)?
  const canGoBack = navigation.canGoBack();

  const handleContinue = async () => {
    await setLocale(selected);
    if (canGoBack) {
      navigation.goBack();
    } else {
      // First launch: language chosen → now show Onboarding
      navigation.replace('Onboarding');
    }
  };

  return (
    <ScreenShell
      backgroundColor={Colors.bgOffWhite}
      topColor={Colors.bgOffWhite}
      bottomColor={Colors.bgOffWhite}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgOffWhite} />

      {/* Back button — only shown when accessed from account */}
      {canGoBack && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={[styles.header, canGoBack && styles.headerWithBack]}>
        <View style={styles.iconWrap}>
          <Text style={styles.globeEmoji}>🌐</Text>
        </View>
        <Text style={styles.title}>{t.langSelect.title}</Text>
        <Text style={styles.subtitle}>{t.langSelect.subtitle}</Text>
      </View>

      {/* Language options */}
      <View style={styles.optionsWrap}>
        {LANGUAGE_OPTIONS.map(opt => {
          const isActive = selected === opt.locale;
          return (
            <TouchableOpacity
              key={opt.locale}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => setSelected(opt.locale)}
              activeOpacity={0.75}
            >
              <View style={styles.optionText}>
                <Text
                  style={[styles.nativeLabel, isActive && styles.textActive]}
                >
                  {opt.nativeLabel}
                </Text>
                {opt.nativeLabel !== opt.label && (
                  <Text style={styles.engLabel}>{opt.label}</Text>
                )}
              </View>

              <View style={[styles.radio, isActive && styles.radioActive]}>
                {isActive && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <NCButton
          label={t.langSelect.cta}
          onPress={handleContinue}
          variant="primary"
          size="lg"
          iconRight="arrowRight"
          fullWidth
        />
      </View>
    </ScreenShell>
  );
};

export default LanguageSelectScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgOffWhite,
    paddingHorizontal: Spacing.screen,
  },

  backBtn: {
    position: 'absolute',
    top: vscale(54),
    left: Spacing.screen,
    zIndex: 10,
    padding: fscale(8),
  },
  backText: {
    fontSize: fscale(22),
    color: Colors.ink,
    fontWeight: '600',
  },

  header: {
    alignItems: 'center',
    paddingTop: vscale(40),
    paddingBottom: vscale(36),
  },
  headerWithBack: {
    paddingTop: vscale(56),
  },

  iconWrap: {
    width: fscale(72),
    height: fscale(72),
    borderRadius: Radii.xl,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: fscale(20),
    ...Shadows.strong,
  },
  globeEmoji: {
    fontSize: fscale(36),
  },
  title: {
    fontSize: fscale(26),
    fontWeight: '700',
    letterSpacing: -0.8,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: fscale(8),
  },
  subtitle: {
    fontSize: fscale(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: fscale(20),
    maxWidth: fscale(280),
  },

  optionsWrap: {
    gap: fscale(15),
    padding: fscale(15),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(14),
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    paddingVertical: fscale(16),
    paddingHorizontal: fscale(16),
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionActive: {
    borderColor: Colors.ink,
    backgroundColor: Colors.bgWhite,
    ...Shadows.card,
  },
  flag: {
    fontSize: fscale(28),
    lineHeight: fscale(32),
  },
  optionText: {
    flex: 1,
  },
  nativeLabel: {
    fontSize: fscale(16),
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  textActive: {
    color: Colors.ink,
  },
  engLabel: {
    fontSize: fscale(12),
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: fscale(22),
    height: fscale(22),
    borderRadius: fscale(11),
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: {
    borderColor: Colors.ink,
  },
  radioDot: {
    width: fscale(12),
    height: fscale(12),
    borderRadius: fscale(6),
    backgroundColor: Colors.ink,
  },

  footer: {
    position: 'absolute',
    bottom: vscale(2),
    left: Spacing.screen,
    right: Spacing.screen,
  },
});
