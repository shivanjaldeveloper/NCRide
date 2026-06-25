import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  HomeTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { TopSafeStrap } from '../../components/layout';
import { NCCard, Icon, Row } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

const AccountScreen = ({ navigation }: Props) => {
  const go = (route: keyof RootStackParamList) =>
    navigation.getParent()?.navigate(route as never);

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
        <Text style={styles.title}>Account</Text>

        <NCCard pad={16} style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AR</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Arya Sengupta</Text>
              <Text style={styles.contact}>
                +91 98300 12428 · arya@ncrride.com
              </Text>
              <View style={styles.tierBadge}>
                <Icon name="reward" size={12} stroke={Colors.lime} />
                <Text style={styles.tierText}>SAPPHIRE TIER</Text>
              </View>
            </View>
          </View>
        </NCCard>

        <NCCard pad={4} style={styles.menuCard}>
          <Row
            icon="pin"
            title="Saved places"
            sub="5 saved · Home, Work, Gym…"
            onPress={() => go('SavedPlaces')}
          />
          <Row
            icon="wallet"
            title="Wallet"
            sub="₹ 2,184.50"
            onPress={() => navigation.navigate('Wallet')}
          />
          <Row
            icon="card"
            title="Payment methods"
            sub="UPI · 1 card · 4 saved"
            onPress={() => go('PaymentMethods')}
          />
          <Row
            icon="coupon"
            title="Coupons & offers"
            sub="3 new offers"
            onPress={() => go('Coupons')}
          />
          <Row
            icon="reward"
            title="Rewards"
            sub="840 points · Sapphire"
            onPress={() => go('Rewards')}
          />
          <Row
            icon="refer"
            title="Refer & earn"
            sub="Earn ₹500 per invite"
            onPress={() => go('Referrals')}
          />
        </NCCard>

        <NCCard pad={4} style={styles.menuCard}>
          <Row icon="chat" title="Help & support" onPress={() => go('SOS')} />
          <Row
            icon="sos"
            title="SOS contacts"
            sub="3 added"
            onPress={() => go('SOS')}
          />
          <Row
            icon="settings"
            title="Settings"
            onPress={() => go('Settings')}
          />
          <Row
            icon="logout"
            title="Log out"
            danger
            onPress={() => go('Logout')}
          />
        </NCCard>

        <Text style={styles.footer}>
          NCRide · v 1.0.0 · Made for Noida &amp; Delhi NCR
        </Text>
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
