import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack, Sheet, TopSafeStrap } from '../../components/layout';
import { NCButton, NCCard, Icon, Row } from '../../components/common';
import type { IconName } from '../../components/common';
import { MapView } from '../../components/map';
import { LocFieldStack } from '../../components/ride';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Courier'>;

interface ParcelType {
  id: string;
  name: string;
  sub: string;
  icon: IconName;
}

const PARCEL_TYPES: ParcelType[] = [
  { id: 'docs', name: 'Documents', sub: '< 0.5 kg', icon: 'invoice' },
  { id: 'small', name: 'Small parcel', sub: '< 3 kg', icon: 'bag' },
  { id: 'medium', name: 'Medium', sub: '< 10 kg', icon: 'courier' },
  { id: 'large', name: 'Large', sub: '< 25 kg', icon: 'courier' },
];

const CourierScreen = ({ navigation }: Props) => {
  const [parcel, setParcel] = useState('docs');

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />

      <HeaderBack
        title="Send a courier"
        sub="Same-city · Pickup in 18 min"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mapArea}>
        <MapView
          height={400}
          style={styles.mapFill}
          showRoute
          showControls={false}
          pickup="Sender · Sector 62, Noida"
          drop="Receiver · Connaught Place"
        />
      </View>

      <Sheet style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LocFieldStack
            pickup="Sector 62, Noida, Tower 4"
            drop="Connaught Place, near Regal Cinema"
          />

          <Text style={styles.sectionLabel}>SENDER DETAILS</Text>

          <NCCard pad={12} style={styles.detailCard}>
            <Row
              icon="user"
              title="Arya Sengupta · +91 98300 12428"
              sub="Sector 62, Noida, Tower 4, Flat 3B"
            />
          </NCCard>

          <Text style={[styles.sectionLabel, styles.spaced]}>
            RECEIVER DETAILS
          </Text>

          <NCCard pad={12} style={styles.detailCard}>
            <Row
              icon="user"
              title="Rituparna Roy · +91 99033 88817"
              sub="Connaught Place, near Regal Cinema, Flat 8A"
            />
          </NCCard>

          <Text style={[styles.sectionLabel, styles.spaced]}>PARCEL TYPE</Text>

          <View style={styles.parcelGrid}>
            {PARCEL_TYPES.map(p => {
              const active = parcel === p.id;

              return (
                <View key={p.id} style={styles.parcelSlot}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setParcel(p.id)}
                    style={[
                      styles.parcelTile,
                      active && styles.parcelTileActive,
                    ]}
                  >
                    <Icon
                      name={p.icon}
                      size={20}
                      stroke={active ? Colors.lime : Colors.ink}
                    />

                    <View>
                      <Text
                        style={[
                          styles.parcelName,
                          active && styles.parcelNameActive,
                        ]}
                      >
                        {p.name}
                      </Text>

                      <Text
                        style={[
                          styles.parcelSub,
                          active && styles.parcelSubActive,
                        ]}
                      >
                        {p.sub}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <NCCard pad={14} style={styles.fareCard}>
            <View style={styles.fareRow}>
              <View>
                <Text style={styles.sectionLabel}>FARE ESTIMATE</Text>

                <Text style={styles.fareAmount}>₹ 124.00</Text>

                <Text style={styles.fareNote}>
                  Includes pickup, GST · pay before pickup
                </Text>
              </View>

              <View style={styles.discountChip}>
                <Text style={styles.discountText}>PARCEL25 saves ₹25</Text>
              </View>
            </View>
          </NCCard>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />

          <View style={styles.footerContent}>
            <NCButton
              label="Book courier · ₹99"
              iconRight="arrowRight"
              onPress={() => navigation.navigate('CourierSummary')}
              variant="primary"
              size="lg"
            />
          </View>
        </View>
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgOffWhite,
  },

  mapArea: {
    height: '38%',
    overflow: 'hidden',
  },

  mapFill: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },

  sheet: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.md,
  },

  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  spaced: {
    marginTop: Spacing.md,
  },

  detailCard: {
    marginTop: Spacing.sm,
  },

  parcelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    marginHorizontal: -Spacing.xs / 2,
  },

  parcelSlot: {
    width: '50%',
    paddingHorizontal: Spacing.xs / 2,
    marginBottom: Spacing.sm,
  },

  parcelTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.borderSoft,
  },

  parcelTileActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },

  parcelName: {
    fontSize: fscale(13),
    fontWeight: '700',
    color: Colors.ink,
  },

  parcelNameActive: {
    color: '#fff',
  },

  parcelSub: {
    fontSize: fscale(11),
    color: Colors.textSecondary,
    marginTop: 2,
  },

  parcelSubActive: {
    color: 'rgba(255,255,255,0.6)',
  },

  fareCard: {
    marginTop: Spacing.md,
  },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  fareAmount: {
    fontSize: fscale(26),
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 2,
  },

  fareNote: {
    fontSize: fscale(11),
    color: Colors.textSecondary,
    marginTop: 2,
  },

  discountChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.lime,
    alignSelf: 'flex-start',
  },

  discountText: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.ink,
  },

  footer: {
    backgroundColor: Colors.bgWhite,
  },

  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  footerContent: {
    padding: Spacing.md,
  },
});

export default CourierScreen;
