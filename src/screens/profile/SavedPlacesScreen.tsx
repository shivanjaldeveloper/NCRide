import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack } from '../../components/layout';
import { NCCard, Icon, Row } from '../../components/common';
import type { IconName } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlaces'>;

interface SavedPlace {
  icon: IconName;
  title: string;
  sub: string;
  accent?: string;
  pin: { x: number; y: number };
}

const PLACES: SavedPlace[] = [
  {
    icon: 'home',
    title: 'Home',
    sub: 'Sector 62, Noida, Tower 4, Flat 3B',
    accent: '#E9F8E4',
    pin: { x: 30, y: 60 },
  },
  {
    icon: 'pin',
    title: 'Work',
    sub: 'Advant Navis Business Park, Sector 142',
    accent: '#E8F1FF',
    pin: { x: 60, y: 40 },
  },
  {
    icon: 'pin',
    title: 'Gym',
    sub: 'DLF Mall of India, Sector 18, ground floor',
    pin: { x: 75, y: 70 },
  },
  {
    icon: 'pin',
    title: 'Maa & Papa',
    sub: 'Indirapuram, Ghaziabad',
    pin: { x: 20, y: 30 },
  },
  {
    icon: 'pin',
    title: 'Best friend',
    sub: 'Vaishali, Ghaziabad',
    pin: { x: 50, y: 80 },
  },
];

const SavedPlacesScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.bgOffWhite }}
      >
        <HeaderBack
          title="Saved places"
          onBack={() => navigation.goBack()}
          right={
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
              <Icon name="plus" size={20} stroke={Colors.ink} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MapView height={fscale(180)} showRoute={false} showControls={false}>
          {PLACES.map(p => (
            <View
              key={p.title}
              style={[
                styles.mapPin,
                { left: `${p.pin.x}%`, top: `${p.pin.y}%` },
              ]}
              pointerEvents="none"
            >
              <Svg width={26} height={32} viewBox="0 0 28 34">
                <Path
                  d="M14 2 C 21 2 25 7 25 13 C 25 19 19 26 14 32 C 9 26 3 19 3 13 C 3 7 7 2 14 2 Z"
                  fill={Colors.ink}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <Circle cx={14} cy={13} r={4} fill={Colors.lime} />
              </Svg>
            </View>
          ))}
        </MapView>

        <View style={styles.list}>
          {PLACES.map(p => (
            <NCCard key={p.title} pad={12} style={styles.placeCard}>
              <Row
                icon={p.icon}
                title={p.title}
                sub={p.sub}
                accent={p.accent}
                right={
                  <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
                    <Icon name="edit" size={16} stroke={Colors.ink} />
                  </TouchableOpacity>
                }
              />
            </NCCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: fscale(40) },

  addBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapPin: {
    position: 'absolute',
    transform: [{ translateX: -13 }, { translateY: -32 }],
  },

  list: { marginTop: Spacing.md, gap: Spacing.sm },
  placeCard: {},
  editBtn: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SavedPlacesScreen;
