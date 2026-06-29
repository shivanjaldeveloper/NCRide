import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCButton, NCCard, Icon, Row } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'SOS'>;

const EMERGENCY_CONTACTS = [
  { title: 'Maa (Sucharita)', sub: '+91 98300 12428' },
  { title: 'Papa (Subhayan)', sub: '+91 98745 33129' },
  { title: 'Best friend', sub: '+91 99033 88817' },
];

const SOS_BG = '#FCE6E0';

const SOSScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();

  return (
    <ScreenShell topColor={SOS_BG} bottomColor={Colors.bgOffWhite} backgroundColor={SOS_BG}>
      <HeaderBack title={t.sos.screenTitle} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sosCard}>
          <View style={styles.sosHeader}>
            <View style={styles.sosIconWrap}>
              <Icon name="sos" size={26} stroke="#fff" sw={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sosTitle}>{t.sos.tapHold}</Text>
              <Text style={styles.sosSub}>{t.sos.tapHoldSub}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.holdBtn} activeOpacity={0.85}>
            <Text style={styles.holdBtnText}>{t.sos.holdBtn}</Text>
          </TouchableOpacity>
        </View>

        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>{t.sos.emergencyContacts}</Text>
          {EMERGENCY_CONTACTS.map(c => (
            <Row key={c.title} icon="user" title={c.title} sub={c.sub} right={<Icon name="phone" size={18} stroke={Colors.green} />} />
          ))}
          <NCButton label={t.sos.addContact} icon="plus" onPress={() => {}} variant="glass" size="sm" style={styles.addContactBtn} />
        </NCCard>

        <NCCard style={styles.card}>
          <Text style={styles.sectionLabel}>{t.sos.helpSupport}</Text>
          <Row icon="chat" title={t.sos.chatSupport} sub={t.sos.chatSupportSub} onPress={() => navigation.navigate('Chat')} />
          <Row icon="phone" title={t.sos.callHelpline} sub={t.sos.callHelplineSub} onPress={() => {}} />
          <Row icon="invoice" title={t.sos.reportIssue} sub={t.sos.reportIssueSub} onPress={() => {}} />
          <Row icon="shield" title={t.sos.trustSafety} onPress={() => {}} />
        </NCCard>
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(60) },
  sosCard: { backgroundColor: Colors.red, borderRadius: Radii.xxl, padding: Spacing.xl, marginTop: Spacing.xs },
  sosHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sosIconWrap: { width: fscale(56), height: fscale(56), borderRadius: fscale(28), backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  sosTitle: { fontSize: fscale(19), fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  sosSub: { fontSize: fscale(12), color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  holdBtn: { marginTop: Spacing.lg, height: fscale(56), borderRadius: Radii.lg, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  holdBtnText: { fontSize: fscale(14), fontWeight: '700', color: '#fff' },
  card: { marginTop: Spacing.md },
  sectionLabel: { fontSize: fscale(11), fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4, marginBottom: Spacing.xs },
  addContactBtn: { marginTop: Spacing.sm },
});

export default SOSScreen;
