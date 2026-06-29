import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  HomeTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { TopSafeStrap } from '../../components/layout';
import { NCCard, Icon } from '../../components/common';
import type { IconName } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Activity'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface ActivityItem {
  id: string;
  icon: IconName;
  title: string;
  sub: string;
  tag: string;
  tagColor: string;
  tagBg: string;
}

const UPCOMING: ActivityItem[] = [
  {
    id: 'NR-RV-892412',
    icon: 'reserve',
    title: 'Reserve · Sector 62 → Airport T3',
    sub: 'NCRide Prime · Sat 22 Mar · 05:00',
    tag: 'Scheduled',
    tagColor: Colors.blue,
    tagBg: '#E8F1FF',
  },
  {
    id: 'NR-IC-447721',
    icon: 'intercity',
    title: 'Intercity · Noida → Gurugram',
    sub: 'NCRide XL · Fri 21 Mar · 09:00',
    tag: 'Confirmed',
    tagColor: Colors.green,
    tagBg: '#E9F8E4',
  },
];

const PAST: ActivityItem[] = [
  {
    id: 'NR-N22-78421',
    icon: 'taxi',
    title: 'Sector 62, Noida → Connaught Place',
    sub: 'Auto Rickshaw · Yesterday',
    tag: '₹110 · Paid',
    tagColor: Colors.ink,
    tagBg: Colors.bgOffWhite,
  },
  {
    id: 'NR-CR-552411',
    icon: 'courier',
    title: 'Documents · Sec 62 → Connaught Place',
    sub: 'Same-city courier · 2 days ago',
    tag: '₹99 · Paid',
    tagColor: Colors.ink,
    tagBg: Colors.bgOffWhite,
  },
  {
    id: 'NR-N22-78101',
    icon: 'car',
    title: 'Sector 18 → Botanical Garden Metro',
    sub: 'E-Rickshaw · 2 days ago',
    tag: '₹45 · Paid',
    tagColor: Colors.ink,
    tagBg: Colors.bgOffWhite,
  },
  {
    id: 'NR-N22-77501',
    icon: 'taxi',
    title: 'Noida Sector 16 → India Gate',
    sub: 'Auto Rickshaw · 5 days ago',
    tag: '₹96 · Paid',
    tagColor: Colors.ink,
    tagBg: Colors.bgOffWhite,
  },
  {
    id: 'NR-N22-77302',
    icon: 'taxi',
    title: 'Indirapuram → Hauz Khas',
    sub: 'Auto · 7 days ago',
    tag: '₹128 · Paid',
    tagColor: Colors.ink,
    tagBg: Colors.bgOffWhite,
  },
];

const ActivityScreen = ({ navigation }: Props) => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const list = tab === 'upcoming' ? UPCOMING : PAST;

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.sub}>All your rides in NCR</Text>
        </View>
      </View>

      {/* Segmented control */}
      <View style={styles.segWrap}>
        <View style={styles.seg}>
          {(
            [
              ['upcoming', 'Upcoming · 2'],
              ['past', 'Past · 5'],
            ] as const
          ).map(([id, label]) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.8}
              onPress={() => setTab(id)}
              style={[styles.segBtn, tab === id && styles.segBtnActive]}
            >
              <Text
                style={[styles.segLabel, tab === id && styles.segLabelActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {list.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('BookingDetail', {
                id: item.id,
                title: item.title,
                icon: item.icon,
              })
            }
          >
            <NCCard pad={fscale(14)} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.itemIcon}>
                  <Icon name={item.icon} size={20} stroke={Colors.ink} />
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSub} numberOfLines={1}>
                    {item.sub}
                  </Text>
                  <Text style={styles.itemId}>{item.id}</Text>
                </View>

                <View style={styles.itemRight}>
                  <View
                    style={[styles.tagChip, { backgroundColor: item.tagBg }]}
                  >
                    <Text style={[styles.tagText, { color: item.tagColor }]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Icon
                    name="chevron"
                    size={16}
                    stroke={Colors.textTertiary}
                    style={styles.chevron}
                  />
                </View>
              </View>
            </NCCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },

  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: fscale(8),
    paddingBottom: fscale(4),
  },
  title: {
    fontSize: fscale(28),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.8,
  },
  sub: { fontSize: fscale(13), color: Colors.textSecondary, marginTop: 4 },

  segWrap: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.md },
  seg: {
    flexDirection: 'row',
    gap: fscale(4),
    padding: fscale(4),
    backgroundColor: Colors.bgLight,
    borderRadius: Radii.lg,
  },
  segBtn: {
    flex: 1,
    paddingVertical: fscale(10),
    borderRadius: fscale(11),
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segLabel: {
    fontSize: fscale(13),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segLabelActive: { color: Colors.ink },

  listContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: fscale(110),
    gap: Spacing.sm,
  },
  card: {},

  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemIcon: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  itemSub: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemId: {
    fontSize: fscale(10),
    color: Colors.textTertiary,
    marginTop: fscale(6),
    fontVariant: ['tabular-nums'],
  },

  itemRight: { alignItems: 'flex-end', gap: fscale(8) },
  tagChip: {
    paddingHorizontal: fscale(8),
    paddingVertical: fscale(4),
    borderRadius: Radii.sm,
  },
  tagText: { fontSize: fscale(11), fontWeight: '700' },
  chevron: { marginTop: fscale(2) },
});

export default ActivityScreen;
