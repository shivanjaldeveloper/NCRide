import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCCard, Row } from '../../components/common';
import { Colors, Spacing, fscale } from '../../theme';
import { useTranslation } from '../../i18n';
import { getUsername } from '../../utils/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const Switch = ({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.8}
    style={[styles.switchTrack, value && styles.switchTrackOn]}
  >
    <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const INITIAL_TOGGLES = t.settings.toggles.map(tog => ({
    ...tog,
    value: ['push', 'location', 'biometric', 'faceid', 'sharetrip'].includes(
      tog.key,
    ),
  }));
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);

  // Real session mobile number (set by setSession() after VerifyOtp /
  // VerifyCookie / UpdateProfile) — re-read on every focus.
  const [mobile, setMobile] = useState('');
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getUsername().then(u => {
        if (!cancelled) setMobile(u ?? '');
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleToggle = (key: string) =>
    setToggles(prev =>
      prev.map(item =>
        item.key === key ? { ...item, value: !item.value } : item,
      ),
    );

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack
          title={t.settings.title}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>PROFILE</Text>
        <NCCard pad={4} style={styles.card}>
          <Row
            icon="user"
            title="Personal info"
            sub="Name, email, photo"
            onPress={() => {}}
          />
          <Row
            icon="phone"
            title="Mobile"
            sub={mobile ? `+91 ${mobile} · Verified` : 'Verified'}
            onPress={() => {}}
          />
          <Row
            icon="shield"
            title="Identity verification"
            sub="DigiLocker · Aadhaar verified"
            onPress={() => {}}
          />
        </NCCard>

        <Text style={styles.sectionLabel}>
          {t.settings.notificationsSection}
        </Text>
        <NCCard pad={4} style={styles.card}>
          {toggles.map((tog, i) => (
            <View key={tog.key}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{tog.label}</Text>
                <Switch
                  value={tog.value}
                  onToggle={() => handleToggle(tog.key)}
                />
              </View>
              {i < toggles.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </NCCard>

        <Text style={styles.sectionLabel}>PRIVACY & SAFETY</Text>
        <NCCard pad={4} style={styles.card}>
          <Row
            icon="shield"
            title="Trusted contacts"
            sub="3 added"
            onPress={() => navigation.navigate('SOS')}
          />
          <Row icon="user" title="Data & privacy" onPress={() => {}} />
          <Row
            icon="trash"
            title={t.settings.deleteAccount}
            sub={t.settings.deleteAccountSub}
            danger
            onPress={() => {}}
          />
        </NCCard>

        <Text style={styles.footer}>
          {t.settings.appVersion} · {t.settings.buildLabel}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },
  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  card: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: fscale(12),
  },
  toggleLabel: {
    fontSize: fscale(14),
    fontWeight: '500',
    color: Colors.ink,
    flex: 1,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(15,17,21,0.05)',
    marginHorizontal: Spacing.md,
  },
  switchTrack: {
    width: fscale(46),
    height: fscale(26),
    borderRadius: fscale(13),
    backgroundColor: Colors.borderSoft,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackOn: { backgroundColor: Colors.ink },
  switchThumb: {
    width: fscale(22),
    height: fscale(22),
    borderRadius: fscale(11),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  switchThumbOn: { alignSelf: 'flex-end' },
  footer: {
    textAlign: 'center',
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
  },
});

export default SettingsScreen;
