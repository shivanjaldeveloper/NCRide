import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { HeaderBack, Sheet, TopSafeStrap } from '../../components/layout';
import { NCButton, Icon, Stars } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Driver'>;

const DriverScreen = ({ navigation }: Props) => {
  const [eta, setEta] = useState(180);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spin]);

  const min = Math.floor(eta / 60);
  const sec = eta % 60;
  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.root}>
      {/* Solid strap — same as RideScreen */}
      <TopSafeStrap
        backgroundColor={Colors.bgOffWhite}
        barStyle="dark-content"
      />

      {/* Header in normal flow — same as RideScreen */}
      <HeaderBack
        title="Driver assigned"
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
          height={400}
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
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>Rajat Kr. Saha</Text>
              <View style={styles.ratingRow}>
                <Stars value="4.92" />
                <Text style={styles.ratingMeta}>· 2,418 trips · 6 yrs</Text>
              </View>
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.actionBtnLight}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Chat')}
              >
                <Icon name="chat" size={20} stroke={Colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnDark}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Chat')}
              >
                <Icon name="phone" size={20} stroke={Colors.lime} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.vehicleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleLabel}>
                YELLOW & GREEN AUTO RICKSHAW
              </Text>
              <Text style={styles.vehiclePlate}>DL 5C NC 4421</Text>
            </View>
            <View style={styles.otpChip}>
              <Text style={styles.otpText}>OTP 4 2 8 1</Text>
            </View>
          </View>

          <View style={styles.arrivingCard}>
            <Animated.View
              style={[styles.spinnerWrap, { transform: [{ rotate: spinDeg }] }]}
            >
              <Icon name="route" size={20} stroke={Colors.lime} sw={2} />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text style={styles.arrivingLabel}>ARRIVING</Text>
              <Text style={styles.arrivingTime}>
                {min} min {sec.toString().padStart(2, '0')} sec
              </Text>
            </View>
            <NCButton
              label="Track"
              onPress={() => navigation.navigate('Tracking')}
              variant="accent"
              size="sm"
              fullWidth={false}
            />
          </View>

          <View style={styles.bottomRow}>
            <View style={{ flex: 1 }}>
              <NCButton
                label="Share trip"
                icon="link"
                onPress={() => {}}
                variant="glass"
                size="md"
              />
            </View>
            <View style={{ flex: 1 }}>
              <NCButton
                label="Cancel"
                icon="close"
                onPress={() => navigation.navigate('HomeTabs')}
                variant="ghost"
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
    height: '38%',
    overflow: 'hidden',
  },
  mapFill: { borderRadius: 0, width: '100%', height: '100%' },
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
  sheetWrap: {
    flex: 1,
  },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: {
    width: fscale(56),
    height: fscale(56),
    borderRadius: fscale(28),
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fscale(18), fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: fscale(18),
    height: fscale(18),
    borderRadius: fscale(9),
    backgroundColor: Colors.green,
    borderWidth: 3,
    borderColor: '#fff',
  },
  driverName: {
    fontSize: fscale(15),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingMeta: { fontSize: fscale(11.5), color: Colors.textSecondary },
  actionBtns: { flexDirection: 'row', gap: Spacing.sm },
  actionBtnLight: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDark: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgOffWhite,
    borderRadius: Radii.lg,
  },
  vehicleLabel: {
    fontSize: fscale(11),
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  vehiclePlate: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  otpChip: {
    paddingHorizontal: fscale(10),
    paddingVertical: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.ink,
  },
  otpText: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  arrivingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xl,
  },
  spinnerWrap: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: fscale(22),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivingLabel: {
    fontSize: fscale(11),
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  arrivingTime: {
    fontSize: fscale(20),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
  },
  bottomRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});

export default DriverScreen;
