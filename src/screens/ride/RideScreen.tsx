import React, { useMemo, useState } from 'react';
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
import { HeaderBack, Sheet } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { MapView } from '../../components/map';
import { LocFieldStack, RideCard } from '../../components/ride';
import type { RideOption } from '../../components/ride';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { RIDE_TYPES } from '../../constants/ridesData';

type Props = NativeStackScreenProps<RootStackParamList, 'Ride'>;

// Matches the reference's per-mode title/subtitle and ride-type filtering.
const MODE_META: Record<
  string,
  { title: string; sub: string; ids: string[] }
> = {
  ride: { title: 'Where to?', sub: 'Rides in Noida & Delhi NCR', ids: ['mini', 'sedan', 'prime', 'xl'] },
  cab: { title: 'Book a Car', sub: 'Mini · Sedan · Prime · XL', ids: ['mini', 'sedan', 'prime', 'xl'] },
  bike: { title: 'Book a Bike', sub: 'Fastest way in NCR traffic', ids: ['bike'] },
  reserve: { title: 'Reserve a Ride', sub: 'Schedule for later · ₹50 booking fee', ids: ['mini', 'sedan', 'prime', 'xl'] },
  intercity: { title: 'Intercity Ride', sub: 'Outstation · One-way & round trip', ids: ['sedan', 'prime', 'xl'] },
};

const RideScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const mode = route.params?.mode ?? 'ride';
  const meta = MODE_META[mode] ?? MODE_META.ride;

  const rides = useMemo(
    () => RIDE_TYPES.filter(r => meta.ids.includes(r.id)),
    [meta],
  );

  const [pickup, setPickup] = useState('Sector 62, Noida');
  const [drop, setDrop] = useState(
    mode === 'intercity' ? 'Jaipur, Rajasthan' : 'Connaught Place, Delhi',
  );
  const [selected, setSelected] = useState<RideOption | undefined>(rides[0]);

  const handleSwap = () => {
    setPickup(drop);
    setDrop(pickup);
  };

  return (
    <View style={styles.root}>
      <View style={styles.mapArea}>
        <MapView
          height={400}
          style={styles.mapFill}
          showRoute
          showControls={false}
          pickup={pickup}
          drop={drop}
        />
      </View>

      <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
        <HeaderBack
          title={meta.title}
          sub={meta.sub}
          onBack={() => navigation.goBack()}
          right={
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75}>
              <Icon name="filter" size={18} stroke={Colors.ink} />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.sheetWrap}>
        <Sheet>
          <ScrollView showsVerticalScrollIndicator={false}>
            <LocFieldStack
              pickup={pickup}
              drop={drop}
              onPickupPress={() => {}}
              onDropPress={() => {}}
              onSwap={handleSwap}
            />

            {mode === 'reserve' && (
              <View style={styles.reserveRow}>
                <TouchableOpacity style={styles.reserveBtn} activeOpacity={0.85}>
                  <Icon name="calendar" size={16} stroke="#fff" />
                  <Text style={styles.reserveBtnText}>Today, 18 Mar · 4:30 PM</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reserveEditBtn} activeOpacity={0.75}>
                  <Icon name="edit" size={16} stroke={Colors.ink} />
                </TouchableOpacity>
              </View>
            )}

            {mode === 'intercity' && (
              <View style={styles.tripTypeRow}>
                {['One-way', 'Round trip', 'Hourly'].map((t, i) => (
                  <View
                    key={t}
                    style={[styles.tripTypeChip, i === 0 && styles.tripTypeChipActive]}
                  >
                    <Text
                      style={[
                        styles.tripTypeText,
                        i === 0 && styles.tripTypeTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.chooseRow}>
              <Text style={styles.chooseLabel}>CHOOSE A RIDE</Text>
              <Text style={styles.chooseMeta}>9.4 km · 22 min</Text>
            </View>

            <View style={styles.rideList}>
              {rides.map(r => (
                <RideCard
                  key={r.id}
                  ride={r}
                  selected={selected?.id === r.id}
                  onSelect={setSelected}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.couponRow} activeOpacity={0.8}>
              <View style={styles.couponIconWrap}>
                <Icon name="coupon" size={18} stroke={Colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.couponTitle}>Apply coupon</Text>
                <Text style={styles.couponSub}>3 offers available · NCR50 saves ₹92</Text>
              </View>
              <Icon name="chevron" size={18} stroke={Colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <TouchableOpacity style={styles.cashBtn} activeOpacity={0.8}>
                <Icon name="cash" size={18} stroke={Colors.ink} />
                <Text style={styles.cashText}>Cash</Text>
                <Icon name="chevronDown" size={14} stroke={Colors.textSecondary} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <NCButton
                  label={`Request ${selected?.name ?? ''}`}
                  iconRight="arrowRight"
                  onPress={() => navigation.navigate('Driver')}
                  variant="primary"
                  size="lg"
                />
              </View>
            </View>
          </ScrollView>
        </Sheet>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  mapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
    overflow: 'hidden',
  },
  mapFill: {
    borderRadius: 0,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  filterBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '52%',
  },

  reserveRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  reserveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.ink,
    borderRadius: Radii.lg,
    paddingVertical: fscale(12),
    paddingHorizontal: Spacing.md,
  },
  reserveBtnText: { fontSize: fscale(13), fontWeight: '600', color: '#fff' },
  reserveEditBtn: {
    width: fscale(48),
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tripTypeRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  tripTypeChip: {
    paddingVertical: fscale(7),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgOffWhite,
  },
  tripTypeChipActive: { backgroundColor: Colors.ink },
  tripTypeText: { fontSize: fscale(12), fontWeight: '600', color: Colors.ink },
  tripTypeTextActive: { color: '#fff' },

  chooseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  chooseLabel: {
    fontSize: fscale(12),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  chooseMeta: { fontSize: fscale(11.5), color: Colors.textSecondary, fontWeight: '500' },

  rideList: { marginTop: Spacing.sm, gap: Spacing.sm },

  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderSoft,
  },
  couponIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponTitle: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },
  couponSub: { fontSize: fscale(11.5), color: Colors.green, fontWeight: '600', marginTop: 1 },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cashBtn: {
    height: fscale(56),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.xl,
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cashText: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },
});

export default RideScreen;
