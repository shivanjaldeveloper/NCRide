import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack, Sheet, TopSafeStrap } from '../../components/layout';
import { NCButton, Icon } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Tracking'>;

const STEPS = [
  'Driver heading to pickup',
  'At pickup point',
  'On the trip',
  'Approaching drop',
];

const TrackingScreen = ({ navigation }: Props) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(3, s + 1)), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.root}>
      {/* Solid strap — same as RideScreen */}
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />

      {/* Header in normal flow — same as RideScreen */}
      <HeaderBack
        title="Live trip"
        sub="ETA · 9 min"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            style={styles.sosBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SOS')}
          >
            <Icon name="sos" size={14} stroke="#fff" sw={2} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        }
      />

      {/* Map absolute full-bleed behind sheet */}
      <View style={styles.mapArea}>
        <MapView
          style={styles.mapFill}
          showRoute
          showControls={false}
          pickup="Sector 62, Noida"
          drop="Connaught Place"
        />
      </View>

      {/* Sheet anchored at bottom */}
      <View style={styles.sheetWrap}>
        <Sheet>
          <View style={styles.driverRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>RK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>Rajat · Auto Rickshaw</Text>
              <Text style={styles.driverMeta}>DL 5C NC 4421 · ★ 4.92</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Icon name="phone" size={18} stroke={Colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Chat')}
            >
              <Icon name="chat" size={18} stroke={Colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.stepsWrap}>
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <View key={s} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepDot,
                      (done || active) && styles.stepDotActive,
                    ]}
                  >
                    {done && (
                      <Icon name="check" size={14} stroke="#fff" sw={2.4} />
                    )}
                    {active && <View style={styles.stepPulse} />}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      (done || active) && styles.stepTextActive,
                      active && styles.stepTextCurrent,
                    ]}
                  >
                    {s}
                  </Text>
                  {active && <Text style={styles.stepNow}>Now</Text>}
                </View>
              );
            })}
          </View>

          <View style={styles.bottomRow}>
            <View style={{ flex: 1 }}>
              <NCButton
                label="Share live"
                icon="link"
                onPress={() => {}}
                variant="glass"
                size="md"
              />
            </View>
            <View style={{ flex: 1 }}>
              <NCButton
                label="Trip complete →"
                iconRight="arrowRight"
                onPress={() => navigation.navigate('Completed')}
                variant="primary"
                size="md"
              />
            </View>
          </View>
        </Sheet>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  mapArea: {
    flex: 1,
  },
  mapFill: {
    flex: 1,
    width: '100%',
    borderRadius: 0,
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: fscale(36),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.red,
  },
  sosText: { fontSize: fscale(12), fontWeight: '700', color: '#fff' },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: fscale(22),
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fscale(14), fontWeight: '700', color: '#fff' },
  driverName: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  driverMeta: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  iconBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsWrap: { marginTop: Spacing.md },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: fscale(6),
  },
  stepDot: {
    width: fscale(22),
    height: fscale(22),
    borderRadius: fscale(11),
    backgroundColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.ink },
  stepPulse: {
    width: fscale(8),
    height: fscale(8),
    borderRadius: fscale(4),
    backgroundColor: Colors.lime,
  },
  stepText: {
    fontSize: fscale(13.5),
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  stepTextActive: { color: Colors.ink },
  stepTextCurrent: { fontWeight: '700' },
  stepNow: {
    marginLeft: 'auto',
    fontSize: fscale(11),
    color: Colors.green,
    fontWeight: '700',
  },
  bottomRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});

export default TrackingScreen;
