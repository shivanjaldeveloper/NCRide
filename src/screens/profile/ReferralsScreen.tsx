import React from 'react';
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
import { NCButton, NCCard, Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Referrals'>;

interface Invite {
  name: string;
  status: string;
  reward: string;
}

const INVITES: Invite[] = [
  { name: 'Rohan Banerjee', status: 'Joined · 12 Mar', reward: '+₹500' },
  {
    name: 'Megha Roy',
    status: 'Signed up · 06 Mar',
    reward: 'Pending first ride',
  },
  { name: 'Tanmay K.', status: 'Invited · 28 Feb', reward: 'Awaiting signup' },
];

const ReferralsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top, backgroundColor: '#F8F1FF' }}>
        <HeaderBack title={t.referrals.title} onBack={() => navigation.goBack()} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <View style={styles.heroIconWrap}>
            <Icon name="refer" size={48} stroke={Colors.ink} sw={1.6} />
          </View>
          <Text style={styles.heroTitle}>{t.referrals.heroTitle}</Text>
          {t.referrals.heroSub}
        </View>

        <NCCard>
          <Text style={styles.label}>{t.referrals.codeLabel}</Text>
          <View style={styles.codeRow}>
            <Icon name="qr" size={20} stroke={Colors.lime} />
            <View style={{ flex: 1 }}>
              <Text style={styles.code}>ARYA-N62</Text>
              <Text style={styles.codeUrl}>ncrride.in/r/ARYA-N62</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} activeOpacity={0.85}>
              <Text style={styles.copyText}>COPY</Text>
            </TouchableOpacity>
          </View>
        </NCCard>

        <View style={styles.shareRow}>
          <View style={{ flex: 1 }}>
            <NCButton
              label={t.referrals.shareBtn}
              icon="link"
              onPress={() => {}}
              variant="primary"
              size="md"
            />
          </View>
          <View style={{ flex: 1 }}>
            <NCButton
              label={t.referrals.whatsappBtn}
              icon="chat"
              onPress={() => {}}
              variant="glass"
              size="md"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t.referrals.invitesLabel}</Text>
        <NCCard pad={4}>
          {INVITES.map((inv, i) => (
            <View key={inv.name}>
              <View style={styles.inviteRow}>
                <View style={styles.inviteAvatar}>
                  <Text style={styles.inviteInitials}>
                    {inv.name
                      .split(' ')
                      .map(w => w[0])
                      .join('')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inviteName}>{inv.name}</Text>
                  <Text style={styles.inviteStatus}>{inv.status}</Text>
                </View>
                <Text
                  style={[
                    styles.inviteReward,
                    {
                      color: inv.reward.startsWith('+')
                        ? Colors.green
                        : Colors.textSecondary,
                    },
                  ]}
                >
                  {inv.reward}
                </Text>
              </View>
              {i < INVITES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </NCCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F1FF' },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },

  heroWrap: { alignItems: 'center', paddingVertical: Spacing.md },
  heroIconWrap: {
    width: fscale(110),
    height: fscale(110),
    borderRadius: fscale(55),
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: fscale(26),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.6,
    marginTop: Spacing.md,
  },
  heroSub: {
    fontSize: fscale(13),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.xl,
  },

  label: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
  },
  code: {
    fontSize: fscale(18),
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  codeUrl: {
    fontSize: fscale(11),
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  copyBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    backgroundColor: Colors.lime,
  },
  copyText: { fontSize: fscale(12), fontWeight: '800', color: Colors.ink },

  shareRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },

  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: fscale(10),
  },
  inviteAvatar: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: fscale(20),
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteInitials: { fontSize: fscale(13), fontWeight: '700', color: '#fff' },
  inviteName: { fontSize: fscale(13.5), fontWeight: '600', color: Colors.ink },
  inviteStatus: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  inviteReward: { fontSize: fscale(13), fontWeight: '800' },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(15,17,21,0.05)',
    marginHorizontal: fscale(10),
  },
});

export default ReferralsScreen;
