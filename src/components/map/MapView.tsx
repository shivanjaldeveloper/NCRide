import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Svg, {
  Rect,
  Path,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Colors, Radii } from '../../theme';
import Icon from '../common/Icon';

interface Props {
  height?: number;
  showRoute?: boolean;
  showControls?: boolean;
  pickup?: string;
  drop?: string;
  /**
   * Vehicle + route animation. Not implemented yet in this RN port — the
   * reference's animated polyline/vehicle marker needs Reanimated to do
   * smoothly and is out of scope for this phase. Passing `true` here is a
   * no-op for now; the static route/pins still render.
   */
  animateVehicle?: boolean;
  /**
   * Optional style override/extension, merged after the component's own
   * `wrap` style. Lets full-screen usages (Ride/Driver/Tracking) square off
   * the corners or position the map absolutely, without affecting any
   * existing call site that doesn't pass it.
   */
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * MapView
 * RN port of the design reference's procedural illustrated map (roads,
 * parks, water, dotted texture) — not a real map SDK. Used wherever the
 * mock shows a stylised map background (location permission, ride
 * tracking, location picker, etc).
 *
 * Phase 1 ships the static look (land/roads/route/pins + floating
 * zoom/locate controls). Animated vehicle-on-route motion is planned for
 * the ride-tracking phase.
 */
const MapView = ({
  height = 280,
  showRoute = true,
  showControls = true,
  pickup = 'Sector 62, Noida',
  drop = 'Connaught Place',
  style,
  children,
}: Props) => {
  // Static sample point along the reference's route curve, used for the
  // (currently non-animated) vehicle marker.
  const routeD =
    'M 60 350 C 140 320, 200 260, 220 200 S 320 130, 380 100';

  return (
    <View style={[styles.wrap, { height }, style]}>
      <Svg
        viewBox="0 0 440 440"
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="routeg" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={Colors.blue} />
            <Stop offset="1" stopColor={Colors.cyan} />
          </LinearGradient>
        </Defs>

        {/* land base */}
        <Rect width="440" height="440" fill={Colors.map} />

        {/* parks/green */}
        <Path
          d="M -20 80 Q 80 60 160 110 Q 220 160 180 220 Q 100 240 20 200 Z"
          fill={Colors.mapGreen}
        />
        <Path
          d="M 280 280 Q 380 260 460 300 L 460 380 L 280 380 Z"
          fill={Colors.mapGreen}
        />

        {/* water */}
        <Path
          d="M -20 380 Q 100 360 220 400 Q 340 440 460 410 L 460 460 L -20 460 Z"
          fill={Colors.mapWater}
        />
        <Path d="M 380 -20 Q 410 60 460 80 L 460 -20 Z" fill={Colors.mapWater} />

        {/* minor road grid */}
        <Line x1="0" y1="60" x2="440" y2="80" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />
        <Line x1="0" y1="160" x2="440" y2="170" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />
        <Line x1="0" y1="260" x2="440" y2="280" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />
        <Line x1="0" y1="350" x2="440" y2="370" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />
        <Line x1="80" y1="0" x2="100" y2="440" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />
        <Line x1="200" y1="0" x2="220" y2="440" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />
        <Line x1="320" y1="0" x2="340" y2="440" stroke={Colors.mapRoadMinor} strokeWidth={6} strokeLinecap="round" />

        {/* major roads */}
        <Path
          d="M -10 220 C 100 200, 200 230, 320 200 S 430 180, 460 200"
          fill="none"
          stroke={Colors.mapRoad}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <Path
          d="M 130 -10 C 150 100, 120 200, 180 320 S 230 430, 220 470"
          fill="none"
          stroke={Colors.mapRoad}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <Path d="M 0 110 Q 200 90 440 130" fill="none" stroke="#EFE9DC" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
        <Path d="M 0 300 Q 220 320 440 290" fill="none" stroke="#EFE9DC" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
        <Path d="M 280 0 Q 320 200 360 440" fill="none" stroke="#EFE9DC" strokeWidth={10} strokeLinecap="round" opacity={0.9} />

        {/* route */}
        {showRoute && (
          <>
            <Path
              d={routeD}
              stroke="rgba(46,125,255,0.25)"
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
            />
            <Path d={routeD} stroke="url(#routeg)" strokeWidth={5} fill="none" strokeLinecap="round" />
          </>
        )}

        {/* pickup pin */}
        {showRoute && (
          <>
            <Circle cx={60} cy={350} r={10} fill="#fff" stroke={Colors.green} strokeWidth={3} />
            <Circle cx={60} cy={350} r={3.5} fill={Colors.green} />
          </>
        )}

        {/* drop pin */}
        {showRoute && (
          <Path
            d="M380,78 C390,78 394,86 394,94 C394,104 386,112 380,122 C374,112 366,104 366,94 C366,86 370,78 380,78 Z"
            fill={Colors.ink}
          />
        )}
        {showRoute && <Circle cx={380} cy={94} r={5} fill="#fff" />}
      </Svg>

      {/* floating zoom/locate controls */}
      {showControls && (
        <View style={styles.controls}>
          {(['plus', 'minus', 'locate'] as const).map(n => (
            <TouchableOpacity key={n} style={styles.controlBtn} activeOpacity={0.8}>
              <Icon name={n} size={18} stroke={Colors.ink} sw={1.8} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* pickup/drop label chips */}
      {showRoute && (
        <View style={styles.chips}>
          <View style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: Colors.green }]} />
            <Text style={styles.chipText} numberOfLines={1}>
              {pickup}
            </Text>
          </View>
          <View style={styles.chip}>
            <View style={[styles.chipDot, styles.chipDotSquare, { backgroundColor: Colors.ink }]} />
            <Text style={styles.chipText} numberOfLines={1}>
              {drop}
            </Text>
          </View>
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: Colors.map,
    position: 'relative',
  },
  controls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chips: {
    position: 'absolute',
    left: 12,
    top: 12,
    gap: 6,
    maxWidth: '72%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipDotSquare: {
    borderRadius: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.ink,
    flexShrink: 1,
  },
});

export default MapView;
