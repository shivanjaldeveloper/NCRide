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
import { NCButton, Icon } from '../../components/common';
import { MapView } from '../../components/map';
import { LocFieldStack, RideCard } from '../../components/ride';
import type { RideOption } from '../../components/ride';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { AUTO_OPTIONS, ERICKSHAW_OPTIONS } from '../../constants/ridesData';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Ride'>;
type Mode = 'auto' | 'erickshaw';

const RideScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const mode: Mode = route.params?.mode === 'erickshaw' ? 'erickshaw' : 'auto';
  const meta = {
    auto: {
      ...t.ride.auto,
      options: AUTO_OPTIONS,
      defaultDrop: 'Connaught Place, Delhi',
    },
    erickshaw: {
      ...t.ride.erickshaw,
      options: ERICKSHAW_OPTIONS,
      defaultDrop: 'Botanical Garden Metro',
    },
  }[mode];

  const [pickup, setPickup] = useState(
    route.params?.pickup || 'Current Location',
  );
  const [drop, setDrop] = useState(route.params?.drop || meta.defaultDrop);
  const [selected, setSelected] = useState<RideOption | undefined>(
    meta.options[0],
  );

  const handleSwap = () => {
    setPickup(p => {
      setDrop(p);
      return drop;
    });
  };

  return (
    <View style={styles.root}>
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />
      <HeaderBack
        title={meta.title}
        sub={meta.sub}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Icon name="filter" size={18} stroke={Colors.ink} />
          </TouchableOpacity>
        }
      />
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
      <Sheet style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mode === 'erickshaw' && (
            <View style={styles.ecoBanner}>
              <View style={styles.ecoIconWrap}>
                <Icon name="shield" size={18} stroke={Colors.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ecoTitle}>{t.ride.ecoTitle}</Text>
                <Text style={styles.ecoSub}>{t.ride.ecoSub}</Text>
              </View>
            </View>
          )}
          <LocFieldStack
            pickup={pickup}
            drop={drop}
            onPickupPress={() => {}}
            onDropPress={() => {}}
            onSwap={handleSwap}
          />
          <View style={styles.chooseRow}>
            <Text style={styles.chooseLabel}>{t.ride.chooseRide}</Text>
            <Text style={styles.chooseMeta}>9.4 km · 22 min</Text>
          </View>
          <View style={styles.rideList}>
            {meta.options.map(r => (
              <RideCard
                key={r.id}
                ride={r}
                selected={selected?.id === r.id}
                onSelect={setSelected}
                showStrike
              />
            ))}
          </View>
          <TouchableOpacity style={styles.couponRow} activeOpacity={0.8}>
            <View style={styles.couponIconWrap}>
              <Icon name="coupon" size={16} stroke={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.couponTitle}>{t.ride.applyCoupon}</Text>
              <Text style={styles.couponSub}>{t.ride.couponSub}</Text>
            </View>
            <Icon name="chevron" size={16} stroke={Colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.cashBtn} activeOpacity={0.8}>
              <Icon name="cash" size={18} stroke={Colors.ink} />
              <Text style={styles.cashText}>{t.ride.cash}</Text>
              <Icon
                name="chevronDown"
                size={14}
                stroke={Colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <NCButton
                label={`${t.ride.request} ${selected?.name ?? meta.cta}`}
                iconRight="arrowRight"
                onPress={() => navigation.navigate('Driver')}
                variant="primary"
                size="lg"
              />
            </View>
          </View>
        </View>
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  filterBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: fscale(20),
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapArea: { height: '38%', overflow: 'hidden' },
  mapFill: { borderRadius: 0, width: '100%', height: '100%' },
  sheet: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.md },
  ecoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    padding: fscale(10),
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0,194,215,0.08)',
    borderRadius: Radii.lg,
  },
  ecoIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.md,
    backgroundColor: 'rgba(0,194,215,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ecoTitle: { fontSize: fscale(12.5), fontWeight: '700', color: Colors.ink },
  ecoSub: { fontSize: fscale(11), color: Colors.textSecondary, marginTop: 1 },
  chooseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  chooseLabel: {
    fontSize: fscale(12),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  chooseMeta: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rideList: { gap: Spacing.sm },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgOffWhite,
    borderRadius: Radii.lg,
  },
  couponIconWrap: {
    width: fscale(32),
    height: fscale(32),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponTitle: { fontSize: fscale(12.5), fontWeight: '600', color: Colors.ink },
  couponSub: { fontSize: fscale(11), color: Colors.green, marginTop: 1 },
  footer: { backgroundColor: Colors.bgWhite },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
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
