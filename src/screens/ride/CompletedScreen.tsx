import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton, NCCard, Icon, Row } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { useTranslation } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Completed'>;

const initialsOf = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
};

// FinalFareText from the API already comes pre-formatted (e.g. "₹ 184.00").
// Only fall back to a manually-prefixed amount if the text field is missing.
const money = (text?: string): string | null => {
  if (text) return text;
  return null;
};

const CompletedScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const {
    distanceKm,
    durationMin,
    pickup,
    drop,
    fareText,
    driverName,
    vehicleModel,
    vehicleNumber,
  } = route.params ?? {};
  const [rating, setRating] = useState(5);
  const [picked, setPicked] = useState<string[]>([]);

  const toggleCompliment = (c: string) =>
    setPicked(p => (p.includes(c) ? p.filter(x => x !== c) : [...p, c]));

  const tripSummary = [
    distanceKm ? `${distanceKm} km` : null,
    durationMin ? `${durationMin} min` : null,
    drop,
  ]
    .filter(Boolean)
    .join(' · ');

  const fareDisplay = money(fareText);

  const routeSub = [pickup, drop].filter(Boolean).join('  →  ');

  const timeSub = [
    distanceKm ? `${distanceKm} km` : null,
    durationMin ? `${durationMin} min` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const vehicleSub = [vehicleModel, vehicleNumber].filter(Boolean).join(' · ');

  return (
    <ScreenShell
      topColor={Colors.lime}
      bottomColor={Colors.bgOffWhite}
      backgroundColor={Colors.bgOffWhite}
    >
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox="0 0 400 220"
            preserveAspectRatio="none"
          >
            <Path
              d="M0 180 Q 100 140 200 170 T 400 160 L 400 220 L 0 220 Z"
              fill="rgba(15,17,21,0.08)"
            />
          </Svg>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('HomeTabs')}
            activeOpacity={0.75}
          >
            <Icon name="chevronLeft" size={20} stroke={Colors.ink} />
          </TouchableOpacity>
          <View style={styles.checkWrap}>
            <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
              <Circle
                cx={24}
                cy={24}
                r={20}
                stroke={Colors.lime}
                strokeWidth={3}
                fill="none"
              />
              <Path
                d="M14 24 L22 32 L34 18"
                stroke={Colors.lime}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t.completed.title}</Text>
          </View>

          <NCCard style={styles.card} pad={18}>
            <Text style={styles.rateLabel}>{t.completed.rateLabel}</Text>
            <View style={styles.driverRow}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>
                  {initialsOf(driverName) || '—'}
                </Text>
              </View>
              <View>
                <Text style={styles.driverName}>
                  {driverName || t.completed.title}
                </Text>
                {vehicleModel ? (
                  <Text style={styles.driverCar}>{vehicleModel}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setRating(i)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="starFill"
                    size={32}
                    stroke={i <= rating ? Colors.amber : 'rgba(15,17,21,0.15)'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.complimentsRow}>
              {t.completed.compliments.map(c => {
                const active = picked.includes(c);
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.complimentChip,
                      active && styles.complimentChipActive,
                    ]}
                    onPress={() => toggleCompliment(c)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.complimentText,
                        active && styles.complimentTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </NCCard>

          <NCCard style={styles.card} pad={18}>
            <View style={styles.fareTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fareLabel}>{t.completed.fareLabel}</Text>
                <Text style={styles.fareAmount}>{fareDisplay ?? '—'}</Text>
              </View>
              <View style={styles.cashChip}>
                <Icon name="cash" size={14} stroke={Colors.green} sw={1.8} />
                <Text style={styles.cashChipText}>{t.completed.paidCash}</Text>
              </View>
            </View>
          </NCCard>

          {routeSub || timeSub || vehicleSub ? (
            <NCCard style={styles.card} pad={18}>
              <Text style={styles.sectionLabel}>{t.completed.tripDetails}</Text>
              {routeSub ? (
                <Row
                  icon="route"
                  title={t.completed.routeLabel}
                  sub={routeSub}
                />
              ) : null}
              {timeSub ? (
                <Row icon="clock" title={timeSub} sub={undefined} />
              ) : null}
              {vehicleSub ? (
                <Row
                  icon="taxi"
                  title={t.completed.vehicleLabel}
                  sub={vehicleSub}
                />
              ) : null}
            </NCCard>
          ) : null}

          <View style={styles.noteRow}>
            <Icon name="shield" size={16} stroke={Colors.blue} />
            <Text style={styles.noteText}>{t.completed.lostFound}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <NCButton
          label={t.completed.paidBtn}
          onPress={() => navigation.navigate('HomeTabs')}
          variant="primary"
          size="lg"
        />
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgOffWhite },
  hero: {
    height: fscale(150),
    backgroundColor: Colors.lime,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: fscale(12),
    left: Spacing.screen,
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrap: {
    width: fscale(88),
    height: fscale(88),
    borderRadius: fscale(44),
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: fscale(22),
    paddingBottom: fscale(24),
  },
  titleWrap: { alignItems: 'center' },
  title: {
    fontSize: fscale(26),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: fscale(13.5),
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: { marginTop: Spacing.lg },
  fareTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  fareAmount: {
    fontSize: fscale(28),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  cashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(6),
    paddingHorizontal: fscale(10),
    paddingVertical: fscale(7),
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(31,157,107,0.1)',
  },
  cashChipText: {
    fontSize: fscale(11.5),
    fontWeight: '700',
    color: Colors.green,
  },
  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  rateLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  avatarWrap: {
    width: fscale(48),
    height: fscale(48),
    borderRadius: fscale(24),
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fscale(14), fontWeight: '700', color: '#fff' },
  driverName: { fontSize: fscale(14.5), fontWeight: '700', color: Colors.ink },
  driverCar: {
    fontSize: fscale(12),
    color: Colors.textSecondary,
    marginTop: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: fscale(4),
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  complimentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  complimentChip: {
    paddingVertical: fscale(7),
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bgOffWhite,
  },
  complimentChipActive: { backgroundColor: Colors.ink },
  complimentText: {
    fontSize: fscale(12),
    fontWeight: '600',
    color: Colors.ink,
  },
  complimentTextActive: { color: '#fff' },
  bottomBar: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: fscale(14),
    backgroundColor: Colors.bgOffWhite,
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderSoft,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(46,125,255,0.06)',
    borderRadius: Radii.md,
  },
  noteText: { flex: 1, fontSize: fscale(11.5), color: Colors.ink2 },
});

export default CompletedScreen;
