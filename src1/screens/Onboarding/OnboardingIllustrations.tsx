import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Colors } from '../../theme';

const SIZE = 260;

/** Onboarding slide 1 — car + auto on a route, matches reference ScreenOnb1. */
export const Onb1Illustration = () => (
  <Svg width={SIZE} height={SIZE} viewBox="0 0 260 260">
    <Defs>
      <RadialGradient id="onb1bg" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={Colors.lime} stopOpacity={0.4} />
        <Stop offset="1" stopColor={Colors.lime} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={130} cy={130} r={120} fill="url(#onb1bg)" />
    <Circle cx={130} cy={130} r={92} fill="#fff" stroke="rgba(15,17,21,0.06)" />
    <Circle cx={130} cy={130} r={80} fill="#EFF2EE" />
    <Path
      d="M60 160 Q 130 100 200 130"
      stroke="#fff"
      strokeWidth={10}
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M70 170 Q 130 100 200 140"
      stroke={Colors.blue}
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeDasharray="4 4"
    />
    {/* Car */}
    <G transform="translate(148, 118)">
      <Rect width={40} height={24} rx={6} fill={Colors.ink} />
      <Rect x={4} y={4} width={32} height={11} rx={2} fill="#9AC8FF" />
      <Circle cx={10} cy={24} r={4} fill="#222" />
      <Circle cx={30} cy={24} r={4} fill="#222" />
    </G>
    {/* Auto */}
    <G transform="translate(74, 148)">
      <Path d="M0 16 L6 0 H28 V16Z" fill={Colors.amber} />
      <Rect
        x={6}
        y={2}
        width={20}
        height={10}
        rx={2}
        fill={Colors.ink}
        opacity={0.8}
      />
      <Circle cx={8} cy={20} r={4} fill="#222" />
      <Circle cx={24} cy={20} r={4} fill="#222" />
    </G>
    {/* Pin */}
    <Circle
      cx={68}
      cy={148}
      r={8}
      fill="#fff"
      stroke={Colors.green}
      strokeWidth={3}
    />
    <Circle cx={68} cy={148} r={3} fill={Colors.green} />
  </Svg>
);

/** Onboarding slide 2 — three service cards, matches reference ScreenOnb2. */
export const Onb2Illustration = () => (
  <Svg width={SIZE} height={SIZE} viewBox="0 0 260 260">
    <Defs>
      <RadialGradient id="onb2bg" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={Colors.blue} stopOpacity={0.18} />
        <Stop offset="1" stopColor={Colors.blue} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={130} cy={130} r={120} fill="url(#onb2bg)" />

    {/* Auto card */}
    <G transform="translate(42, 65)">
      <Rect
        width={80}
        height={52}
        rx={14}
        fill="#fff"
        stroke="rgba(15,17,21,0.06)"
        strokeWidth={0.5}
      />
      <Path d="M16 36 L22 18 H44 V36Z" fill={Colors.amber} />
      <Rect
        x={22}
        y={20}
        width={20}
        height={12}
        rx={2}
        fill={Colors.ink}
        opacity={0.8}
      />
      <Circle cx={20} cy={40} r={4} fill="#333" />
      <Circle cx={40} cy={40} r={4} fill="#333" />
      <Rect x={50} y={22} width={22} height={6} rx={2} fill={Colors.ink} />
      <Rect
        x={50}
        y={32}
        width={16}
        height={4}
        rx={2}
        fill={Colors.textTertiary}
      />
    </G>

    {/* E-Rickshaw card */}
    <G transform="translate(138, 80)">
      <Rect
        width={80}
        height={52}
        rx={14}
        fill="#fff"
        stroke="rgba(15,17,21,0.06)"
        strokeWidth={0.5}
      />
      <Rect
        x={12}
        y={22}
        width={32}
        height={18}
        rx={4}
        fill={Colors.cyan}
        opacity={0.85}
      />
      <Circle cx={16} cy={42} r={4} fill="#333" />
      <Circle cx={36} cy={42} r={4} fill="#333" />
      <Circle cx={26} cy={22} r={3} fill="#fff" opacity={0.6} />
      <Rect x={50} y={24} width={22} height={6} rx={2} fill={Colors.ink} />
      <Rect
        x={50}
        y={34}
        width={16}
        height={4}
        rx={2}
        fill={Colors.textTertiary}
      />
    </G>

    {/* Intercity card */}
    <G transform="translate(80, 148)">
      <Rect
        width={100}
        height={54}
        rx={14}
        fill="#fff"
        stroke="rgba(15,17,21,0.06)"
        strokeWidth={0.5}
      />
      <Path d="M12 36 L16 22 H54 L58 36 V40 H12Z" fill={Colors.ink} />
      <Rect x={18} y={24} width={32} height={11} rx={2} fill="#9AC8FF" />
      <Circle
        cx={20}
        cy={40}
        r={4}
        fill="#333"
        stroke="#fff"
        strokeWidth={1.5}
      />
      <Circle
        cx={50}
        cy={40}
        r={4}
        fill="#333"
        stroke="#fff"
        strokeWidth={1.5}
      />
      <Rect x={64} y={24} width={28} height={6} rx={2} fill={Colors.ink} />
      <Rect x={64} y={34} width={20} height={4} rx={2} fill={Colors.lime} />
    </G>
  </Svg>
);

/** Onboarding slide 3 — shield + live tracking chip, matches reference ScreenOnb3. */
export const Onb3Illustration = () => (
  <Svg width={SIZE} height={SIZE} viewBox="0 0 260 260">
    <Defs>
      <RadialGradient id="onb3bg" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={Colors.cyan} stopOpacity={0.2} />
        <Stop offset="1" stopColor={Colors.cyan} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={130} cy={130} r={120} fill="url(#onb3bg)" />

    <G transform="translate(130, 92)">
      <Path
        d="M0 -42 L38 -28 L38 10 C38 34 20 52 0 58 C -20 52 -38 34 -38 10 L -38 -28 Z"
        fill={Colors.ink}
      />
      <Path
        d="M-16 0 L-4 14 L20 -16"
        stroke={Colors.lime}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>

    <Circle cx={64} cy={216} r={6} fill={Colors.green} />
    <Circle cx={64} cy={216} r={11} fill={Colors.green} opacity={0.25} />

    <Rect
      x={74}
      y={208}
      width={130}
      height={16}
      rx={8}
      fill="#fff"
      stroke="rgba(15,17,21,0.06)"
      strokeWidth={0.5}
    />
    <SvgText x={82} y={220} fontSize={9} fontWeight="600" fill={Colors.ink}>
      Live · Arriving in 4 min
    </SvgText>
  </Svg>
);
