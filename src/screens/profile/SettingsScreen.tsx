import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCCard, Row } from '../../components/common';
import { Colors, Spacing, fscale } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

interface Toggle {
  key: string;
  label: string;
  value: boolean;
}

const INITIAL_TOGGLES: Toggle[] = [
  { key: 'push', label: 'Push notifications', value: true },
  { key: 'location', label: 'Location while using app', value: true },
  { key: 'biometric', label: 'Biometric login', value: true },
  { key: 'faceid', label: 'Pay with Face ID', value: true },
  { key: 'darkmode', label: 'Show in dark mode', value: false },
  { key: 'sharetrip', label: 'Share my trip on start', value: true },
];

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
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);

  const handleToggle = (key: string) =>
    setToggles(prev =>
      prev.map(t => (t.key === key ? { ...t, value: !t.value } : t)),
    );

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack title="Settings" onBack={() => navigation.goBack()} />
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
            sub="+91 98300 12428 · Verified"
            onPress={() => {}}
          />
          <Row
            icon="shield"
            title="Identity verification"
            sub="DigiLocker · Aadhaar verified"
            onPress={() => {}}
          />
        </NCCard>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <NCCard pad={4} style={styles.card}>
          {toggles.map((t, i) => (
            <View key={t.key}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{t.label}</Text>
                <Switch value={t.value} onToggle={() => handleToggle(t.key)} />
              </View>
              {i < toggles.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </NCCard>

        <Text style={styles.sectionLabel}>PRIVACY &amp; SAFETY</Text>
        <NCCard pad={4} style={styles.card}>
          <Row
            icon="shield"
            title="Trusted contacts"
            sub="3 added"
            onPress={() => navigation.navigate('SOS')}
          />
          <Row icon="user" title="Data & privacy" onPress={() => {}} />
          <Row icon="trash" title="Delete account" danger onPress={() => {}} />
        </NCCard>

        <Text style={styles.footer}>
          NCRide · v 1.0.0 (build 1) · Made for NCR
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
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  card: { marginBottom: Spacing.xs },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: fscale(12),
    paddingHorizontal: fscale(8),
  },
  toggleLabel: { fontSize: fscale(13.5), fontWeight: '500', color: Colors.ink },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(15,17,21,0.05)',
    marginHorizontal: fscale(8),
  },

  switchTrack: {
    width: fscale(46),
    height: fscale(28),
    borderRadius: fscale(14),
    backgroundColor: 'rgba(15,17,21,0.15)',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: { backgroundColor: Colors.ink },
  switchThumb: {
    width: fscale(24),
    height: fscale(24),
    borderRadius: fscale(12),
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  switchThumbOn: { alignSelf: 'flex-end' },

  footer: {
    textAlign: 'center',
    fontSize: fscale(11),
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
  },
});

export default SettingsScreen;
