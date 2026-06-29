import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse, Rect, Circle } from 'react-native-svg';
import { Colors, Radii, fscale } from '../../theme';

export type RideGlyph = 'sedan' | 'suv' | 'auto' | 'bike' | 'erickshaw';

export interface RideOption {
  id: string;
  name: string;
  tag: string;
  eta: string;
  fare: number;
  max: number;
  glyph: RideGlyph;
}

interface Props {
  ride: RideOption;
  selected: boolean;
  onSelect: (ride: RideOption) => void;
  /** Hide the struck-through "was" fare — Auto/E-Rickshaw options don't have one. Defaults to true (unchanged behaviour for existing car/bike/etc cards). */
  showStrike?: boolean;
}

// Vehicle glyphs, ported 1:1 from the reference's inline SVGs (64x40 viewBox).
const Glyph = ({ glyph }: { glyph: RideGlyph }) => {
  switch (glyph) {
    case 'sedan':
      return (
        <Svg width={56} height={35} viewBox="0 0 64 40">
          <Ellipse cx={32} cy={36} rx={22} ry={2} fill="rgba(0,0,0,0.1)" />
          <Path d="M6 28 L12 14 H52 L58 28 V32 H6Z" fill="#0F1115" />
          <Rect
            x={14}
            y={16}
            width={36}
            height={12}
            rx={3}
            fill="#9AC8FF"
            opacity={0.85}
          />
          <Circle
            cx={18}
            cy={32}
            r={5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={2}
          />
          <Circle
            cx={46}
            cy={32}
            r={5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={2}
          />
        </Svg>
      );
    case 'suv':
      return (
        <Svg width={56} height={35} viewBox="0 0 64 40">
          <Ellipse cx={32} cy={36} rx={24} ry={2} fill="rgba(0,0,0,0.1)" />
          <Path d="M4 30 L10 10 H54 L60 30 V34 H4Z" fill="#0F1115" />
          <Rect
            x={12}
            y={12}
            width={40}
            height={14}
            rx={3}
            fill="#9AC8FF"
            opacity={0.85}
          />
          <Circle
            cx={16}
            cy={34}
            r={5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={2}
          />
          <Circle
            cx={48}
            cy={34}
            r={5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={2}
          />
        </Svg>
      );
    case 'auto':
      return (
        <Svg width={56} height={35} viewBox="0 0 64 40">
          <Ellipse cx={32} cy={36} rx={22} ry={2} fill="rgba(0,0,0,0.1)" />
          <Path d="M14 28 L20 12 H44 V28 Z" fill="#F2A03D" />
          <Rect x={44} y={20} width={14} height={8} rx={2} fill="#F2A03D" />
          <Rect
            x={22}
            y={14}
            width={20}
            height={10}
            rx={2}
            fill="#0F1115"
            opacity={0.85}
          />
          <Circle
            cx={22}
            cy={32}
            r={5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={2}
          />
          <Circle
            cx={50}
            cy={32}
            r={5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={2}
          />
        </Svg>
      );
    case 'bike':
      return (
        <Svg width={56} height={35} viewBox="0 0 64 40">
          <Ellipse cx={32} cy={36} rx={22} ry={2} fill="rgba(0,0,0,0.1)" />
          <Circle
            cx={14}
            cy={30}
            r={6}
            fill="none"
            stroke="#0F1115"
            strokeWidth={3}
          />
          <Circle
            cx={50}
            cy={30}
            r={6}
            fill="none"
            stroke="#0F1115"
            strokeWidth={3}
          />
          <Path
            d="M14 30 L26 18 L44 18 L50 30"
            fill="none"
            stroke="#0F1115"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d="M44 18 L40 10"
            stroke="#0F1115"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Rect x={28} y={14} width={14} height={6} fill="#2E7DFF" />
        </Svg>
      );
    case 'erickshaw':
      return (
        <Svg width={52} height={33} viewBox="0 0 60 38">
          <Ellipse cx={30} cy={34} rx={20} ry={2} fill="rgba(0,0,0,0.1)" />
          <Rect
            x={8}
            y={12}
            width={34}
            height={18}
            rx={5}
            fill="#00C2D7"
            opacity={0.85}
          />
          <Rect
            x={12}
            y={16}
            width={26}
            height={10}
            rx={2}
            fill="rgba(255,255,255,0.5)"
          />
          <Circle
            cx={14}
            cy={30}
            r={4.5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={1.5}
          />
          <Circle
            cx={42}
            cy={30}
            r={4.5}
            fill="#0F1115"
            stroke="#fff"
            strokeWidth={1.5}
          />
          <Rect
            x={34}
            y={16}
            width={4}
            height={10}
            rx={1}
            fill="#C8F260"
            opacity={0.9}
          />
        </Svg>
      );
  }
};

/**
 * RideCard
 * Selectable row showing a ride type's glyph, name, ETA, tag, and fare.
 * Inverts to a dark "selected" treatment, matching the reference exactly.
 */
const RideCard = ({ ride, selected, onSelect, showStrike = true }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(ride)}
      style={[styles.card, selected ? styles.cardSelected : styles.cardDefault]}
    >
      <View style={styles.glyphWrap}>
        <Glyph glyph={ride.glyph} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, selected && styles.textInverse]}>
            {ride.name}
          </Text>
          {ride.max > 0 && (
            <Text style={[styles.seats, selected && styles.textInverseFaint]}>
              · {ride.max} seats
            </Text>
          )}
        </View>
        <View style={styles.metaRow}>
          {ride.eta ? (
            <Text
              style={[
                styles.eta,
                { color: selected ? Colors.lime : Colors.green },
              ]}
            >
              {ride.eta} away
            </Text>
          ) : null}
          <Text style={[styles.tag, selected && styles.textInverseFaint]}>
            {ride.eta ? '· ' : ''}
            {ride.tag}
          </Text>
        </View>
      </View>
      <View style={styles.fareWrap}>
        <Text style={[styles.fare, selected && styles.textInverse]}>
          ₹{ride.fare}
        </Text>
        {showStrike ? (
          <Text
            style={[styles.fareStrike, selected && styles.textInverseFaint]}
          >
            ₹{ride.fare + 32}
          </Text>
        ) : (
          <Text style={[styles.estFare, selected && styles.textInverseFaint]}>
            est. fare
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(12),
    paddingHorizontal: fscale(14),
    paddingVertical: fscale(12),
    borderRadius: Radii.xl,
  },
  cardDefault: {
    backgroundColor: Colors.bgWhite,
    borderWidth: 0.5,
    borderColor: Colors.borderSoft,
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    backgroundColor: Colors.ink,
    shadowColor: '#0F1115',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  glyphWrap: {
    width: fscale(60),
    height: fscale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: fscale(6) },
  name: {
    fontSize: fscale(15),
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Colors.ink,
  },
  seats: { fontSize: fscale(11), color: Colors.textSecondary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fscale(6),
    marginTop: 2,
  },
  eta: { fontSize: fscale(11.5), fontWeight: '600' },
  tag: { fontSize: fscale(11.5), color: Colors.textSecondary },
  fareWrap: { alignItems: 'flex-end' },
  fare: {
    fontSize: fscale(16),
    fontWeight: '800',
    letterSpacing: -0.3,
    color: Colors.ink,
  },
  fareStrike: {
    fontSize: fscale(10.5),
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  estFare: {
    fontSize: fscale(10.5),
    color: Colors.textTertiary,
    marginTop: 1,
  },
  textInverse: { color: '#fff' },
  textInverseFaint: { color: 'rgba(255,255,255,0.6)' },
});

export default RideCard;
