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
import { NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

interface NotificationItem {
  icon: IconName;
  tint: string;
  title: string;
  sub: string;
  time: string;
}

interface NotificationGroup {
  date: string;
  items: NotificationItem[];
}

const GROUPS: NotificationGroup[] = [
  {
    date: 'Today',
    items: [
      {
        icon: 'reward',
        tint: '#E9F8E4',
        title: 'You earned 110 NCRide points',
        sub: 'From your Connaught Place trip · added to wallet',
        time: '17:08',
      },
      {
        icon: 'taxi',
        tint: '#FFF4D6',
        title: 'Rajat has arrived',
        sub: 'Auto Rickshaw · DL 5C NC 4421',
        time: '16:42',
      },
      {
        icon: 'coupon',
        tint: '#E9F8E4',
        title: 'NCR50 valid this week',
        sub: 'Get 50% off on rides in NCR · max ₹150',
        time: '09:30',
      },
    ],
  },
  {
    date: 'Yesterday',
    items: [
      {
        icon: 'courier',
        tint: '#FFE9DC',
        title: 'Courier delivered',
        sub: 'Documents · Connaught Place',
        time: '18:20',
      },
      {
        icon: 'shield',
        tint: '#E8F1FF',
        title: 'New SOS contact added',
        sub: 'Best friend · +91 99033 88817',
        time: '11:30',
      },
    ],
  },
  {
    date: 'This week',
    items: [
      {
        icon: 'refer',
        tint: '#F0EBFF',
        title: 'Rohan joined with your code',
        sub: "You've earned ₹500 wallet credit",
        time: 'Mon',
      },
      {
        icon: 'bell',
        tint: '#F4F4F2',
        title: 'Driver Sandeep rated you 5★',
        sub: 'Replied to your trip rating',
        time: 'Sun',
      },
    ],
  },
];

const NotificationsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack
          title="Notifications"
          sub="7 new"
          onBack={() => navigation.goBack()}
          right={
            <TouchableOpacity style={styles.markReadBtn} activeOpacity={0.8}>
              <Icon name="check" size={14} stroke={Colors.ink} />
              <Text style={styles.markReadText}>Mark read</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {GROUPS.map(g => (
          <View key={g.date} style={styles.group}>
            <Text style={styles.groupLabel}>{g.date.toUpperCase()}</Text>
            <NCCard pad={4}>
              {g.items.map((n, i) => (
                <View key={n.title}>
                  <View style={styles.notifRow}>
                    <View
                      style={[
                        styles.notifIconWrap,
                        { backgroundColor: n.tint },
                      ]}
                    >
                      <Icon name={n.icon} size={18} stroke={Colors.ink} />
                    </View>
                    <View style={styles.notifInfo}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifSub}>{n.sub}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                  </View>
                  {i < g.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </NCCard>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },

  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: fscale(36),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  markReadText: { fontSize: fscale(12), fontWeight: '700', color: Colors.ink },

  group: { marginBottom: Spacing.md },
  groupLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
  },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: fscale(10),
  },
  notifIconWrap: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifInfo: { flex: 1, minWidth: 0 },
  notifTitle: {
    fontSize: fscale(13.5),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  notifSub: { fontSize: fscale(12), color: Colors.textSecondary, marginTop: 1 },
  notifTime: {
    fontSize: fscale(10.5),
    color: Colors.textTertiary,
    marginTop: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(15,17,21,0.05)',
    marginHorizontal: fscale(10),
  },
});

export default NotificationsScreen;
