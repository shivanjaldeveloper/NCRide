import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type {
  HomeTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { TopSafeStrap } from '../../components/layout';
import { NCCard, Icon, Row } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';
import { LANGUAGE_OPTIONS } from '../../i18n/translations';
import { getName, getEmail, getUsername } from '../../utils/auth';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Builds the 1-2 letter avatar initials from the logged-in user's name
// (e.g. "Priyankar Bhomwik" -> "PB", "Priyankar" -> "P"). Falls back to a
// generic mark if no name is on file yet (shouldn't normally happen post
// -Registration, but Account can theoretically be reached mid-session).
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AccountScreen = ({ navigation }: Props) => {
  const { t, locale } = useTranslation();
  const go = (route: keyof RootStackParamList) =>
    navigation.getParent()?.navigate(route as never);

  const currentLangLabel =
    LANGUAGE_OPTIONS.find(o => o.locale === locale)?.nativeLabel ?? 'English';

  // Session values (Name/Email/Username) are persisted by setSession() right
  // after VerifyOtp/VerifyCookie/UpdateProfile — read from local storage
  // here rather than duplicating them via navigation params, since this
  // screen can be reached from anywhere in HomeTabs. Re-read on every focus
  // so a profile edit elsewhere shows up without needing a full relaunch.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [n, e, u] = await Promise.all([
          getName(),
          getEmail(),
          getUsername(),
        ]);
        if (cancelled) return;
        setName(n ?? '');
        setEmail(e ?? '');
        setMobile(u ?? '');
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const displayName = name || 'Your account';
  const contactLine = [mobile ? `+91 ${mobile}` : null, email || null]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.account.title}</Text>

        <NCCard pad={16} style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.contact}>{contactLine}</Text>
              <View style={styles.tierBadge}>
                <Icon name="reward" size={12} stroke={Colors.lime} />
                <Text style={styles.tierText}>{t.account.tierLabel}</Text>
              </View>
            </View>
          </View>
        </NCCard>

        <NCCard pad={4} style={styles.menuCard}>
          <Row
            icon="pin"
            title={t.account.savedPlaces}
            sub={t.account.savedPlacesSub}
            onPress={() => go('SavedPlaces')}
          />
          <Row
            icon="wallet"
            title={t.account.wallet}
            sub="₹ 2,184.50"
            onPress={() => navigation.navigate('Wallet')}
          />
          <Row
            icon="card"
            title={t.account.paymentMethods}
            sub={t.account.paymentMethodsSub}
            onPress={() => go('PaymentMethods')}
          />
          <Row
            icon="coupon"
            title={t.account.coupons}
            sub={t.account.couponsSub}
            onPress={() => go('Coupons')}
          />
          <Row
            icon="reward"
            title={t.account.rewards}
            sub={t.account.rewardsSub}
            onPress={() => go('Rewards')}
          />
          <Row
            icon="refer"
            title={t.account.referEarn}
            sub={t.account.referEarnSub}
            onPress={() => go('Referrals')}
          />
        </NCCard>

        <NCCard pad={4} style={styles.menuCard}>
          <Row
            icon="chat"
            title={t.account.helpSupport}
            onPress={() => go('SOS')}
          />
          <Row
            icon="sos"
            title={t.account.sosContacts}
            sub={t.account.sosContactsSub}
            onPress={() => go('SOS')}
          />
          <Row
            icon="settings"
            title={t.account.settings}
            onPress={() => go('Settings')}
          />
          {/* Language switcher */}
          <Row
            icon="edit"
            title={t.account.language}
            sub={currentLangLabel}
            onPress={() => go('LanguageSelect')}
          />
          <Row
            icon="logout"
            title={t.account.logout}
            danger
            onPress={() => go('Logout')}
          />
        </NCCard>

        <Text style={styles.footer}>{t.common.appVersion}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: fscale(8),
    paddingBottom: fscale(110),
  },

  title: {
    fontSize: fscale(28),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.8,
    marginBottom: Spacing.md,
  },

  profileCard: { marginBottom: Spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: fscale(64),
    height: fscale(64),
    borderRadius: fscale(32),
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fscale(20), fontWeight: '700', color: '#fff' },
  name: {
    fontSize: fscale(18),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  contact: { fontSize: fscale(12), color: Colors.textSecondary, marginTop: 2 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: Colors.ink,
    marginTop: Spacing.sm,
  },
  tierText: {
    fontSize: fscale(10),
    fontWeight: '700',
    color: Colors.lime,
    letterSpacing: 0.3,
  },

  menuCard: { marginBottom: Spacing.md },

  footer: {
    fontSize: fscale(11),
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

export default AccountScreen;
