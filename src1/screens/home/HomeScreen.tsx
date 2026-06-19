import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenShell } from '../../components/layout';
import {
  Colors,
  Typography,
  Spacing,
  fscale,
  vscale,
  Radii,
  Shadows,
} from '../../theme';

// ─── Service grid data ─────────────────────────────────────────────────────
const SERVICES = [
  { id: 'car', icon: '🚗', label: 'Car', sub: 'Mini to XL' },
  { id: 'bike', icon: '🏍️', label: 'Bike', sub: 'Fastest' },
  { id: 'auto', icon: '🛺', label: 'Auto', sub: 'Nimble' },
  { id: 'erick', icon: '⚡', label: 'E-Rickshaw', sub: 'Eco ride' },
  { id: 'reserve', icon: '🕐', label: 'Reserve', sub: 'Schedule' },
  { id: 'intercity', icon: '🏔️', label: 'Intercity', sub: 'Outstation' },
];

// ─── Sub-components ────────────────────────────────────────────────────────
const ServiceCard = ({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: string;
  label: string;
  sub: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.serviceCard}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={styles.serviceIconWrap}>
      <Text style={styles.serviceIcon}>{icon}</Text>
    </View>
    <Text style={styles.serviceLabel}>{label}</Text>
    <Text style={styles.serviceSub}>{sub}</Text>
  </TouchableOpacity>
);

// ─── Home Screen ───────────────────────────────────────────────────────────
const HomeScreen = () => {
  return (
    <ScreenShell
      topColor={Colors.bgOffWhite}
      bottomColor={Colors.bgOffWhite}
      backgroundColor={Colors.bgOffWhite}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AR</Text>
            </View>
            <View>
              <Text style={styles.greeting}>GOOD MORNING</Text>
              <Text style={styles.headerTitle}>Arya, where to?</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Text style={styles.iconEmoji}>⏱️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Text style={styles.iconEmoji}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location pill */}
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.8}>
          <Text style={styles.locationEmoji}>📍</Text>
          <Text style={styles.locationText}>Sector 62, Noida</Text>
          <Text style={styles.locationChev}>▾</Text>
        </TouchableOpacity>

        {/* Search card */}
        <View style={[styles.searchCard, Shadows.card]}>
          <TouchableOpacity style={styles.searchRow} activeOpacity={0.8}>
            <View style={styles.searchIconWrap}>
              <Text style={styles.searchEmoji}>🔍</Text>
            </View>
            <View style={styles.searchTextWrap}>
              <Text style={styles.searchLabel}>Where to?</Text>
              <Text style={styles.searchHint}>
                Connaught Place · 38 min by car
              </Text>
            </View>
            <TouchableOpacity style={styles.laterBtn} activeOpacity={0.7}>
              <Text style={styles.laterText}>⏱ Later</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Map preview */}
          <View style={styles.mapPreview}>
            {/* Simplified map */}
            <View style={styles.mapRoadH} />
            <View style={styles.mapRoadV} />
            <View style={styles.mapRoute} />
            <View style={styles.mapDotFrom}>
              <View style={styles.mapDotInner} />
            </View>
            <View style={styles.mapDotTo}>
              <View
                style={[
                  styles.mapDotInner,
                  { backgroundColor: Colors.primary },
                ]}
              />
            </View>

            {/* Waypoint pills */}
            <View style={[styles.waypointPill, { top: '38%', left: '5%' }]}>
              <View style={[styles.wpDot, { backgroundColor: Colors.green }]} />
              <Text style={styles.wpText}>Sector 62, Noida</Text>
            </View>
            <View style={[styles.waypointPill, { top: '58%', left: '30%' }]}>
              <View
                style={[styles.wpDot, { backgroundColor: Colors.primary }]}
              />
              <Text style={styles.wpText}>Connaught Place</Text>
            </View>

            {/* Book CTA overlay */}
            <View style={styles.bookOverlay}>
              <View>
                <Text style={styles.routeLabel}>Suggested route</Text>
                <Text style={styles.routeMeta}>38 min · ₹228</Text>
              </View>
              <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
                <Text style={styles.bookBtnText}>Book →</Text>
              </TouchableOpacity>
            </View>

            {/* Zoom controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.7}>
                <Text style={styles.zoomText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SERVICES</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICES.map(s => (
            <ServiceCard
              key={s.id}
              icon={s.icon}
              label={s.label}
              sub={s.sub}
              onPress={() => {}}
            />
          ))}
        </View>

        {/* Promo banner */}
        <View style={styles.promoBanner}>
          <View>
            <Text style={styles.promoEyebrow}>LIMITED OFFER</Text>
            <Text style={styles.promoTitle}>50% off your first ride</Text>
          </View>
          <Text style={styles.promoEmoji}>🎉</Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: vscale(24),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vscale(12),
    marginBottom: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: fscale(20),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.label,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  greeting: { ...Typography.label, color: Colors.textTertiary },
  headerTitle: { ...Typography.h4, color: Colors.textPrimary },
  headerIcons: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: fscale(16) },

  // Location
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.pillBg,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
  },
  locationEmoji: { fontSize: fscale(13) },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  locationChev: { fontSize: fscale(11), color: Colors.textSecondary },

  // Search card
  searchCard: {
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmoji: { fontSize: fscale(16), color: Colors.textInverse },
  searchTextWrap: { flex: 1 },
  searchLabel: { ...Typography.h4, color: Colors.textPrimary },
  searchHint: { ...Typography.caption, color: Colors.textSecondary },
  laterBtn: {
    backgroundColor: Colors.pillBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
  },
  laterText: { ...Typography.caption, color: Colors.textSecondary },

  // Map preview
  mapPreview: {
    height: vscale(160),
    backgroundColor: Colors.mapBlue,
    position: 'relative',
    overflow: 'hidden',
  },
  mapRoadH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: fscale(10),
    backgroundColor: Colors.mapRoad,
    opacity: 0.6,
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: fscale(10),
    backgroundColor: Colors.mapRoad,
    opacity: 0.6,
  },
  mapRoute: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '10%',
    height: 3,
    backgroundColor: Colors.blue,
    borderRadius: 2,
  },
  mapDotFrom: {
    position: 'absolute',
    top: '20%',
    left: '13%',
    width: fscale(14),
    height: fscale(14),
    borderRadius: fscale(7),
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDotTo: {
    position: 'absolute',
    top: '20%',
    right: '8%',
    width: fscale(14),
    height: fscale(14),
    borderRadius: fscale(7),
    backgroundColor: Colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDotInner: {
    width: fscale(8),
    height: fscale(8),
    borderRadius: fscale(4),
    backgroundColor: Colors.green,
  },

  waypointPill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgWhite,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    ...Shadows.card,
  },
  wpDot: {
    width: fscale(6),
    height: fscale(6),
    borderRadius: 3,
  },
  wpText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontSize: fscale(10),
  },

  bookOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.card,
  },
  routeLabel: { ...Typography.caption, color: Colors.textSecondary },
  routeMeta: { ...Typography.h4, color: Colors.textPrimary },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  bookBtnText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontSize: fscale(14),
  },

  zoomControls: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    gap: 2,
  },
  zoomBtn: {
    width: fscale(28),
    height: fscale(28),
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  zoomText: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontSize: fscale(16),
  },

  // Services
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.label, color: Colors.textTertiary },
  seeAll: { ...Typography.bodySmall, color: Colors.blue, fontWeight: '600' },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  serviceCard: {
    width: '31%',
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  serviceIconWrap: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: Radii.sm,
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  serviceIcon: { fontSize: fscale(20) },
  serviceLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  serviceSub: { ...Typography.caption, color: Colors.textSecondary },

  // Promo
  promoBanner: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoEyebrow: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  promoTitle: { ...Typography.h4, color: Colors.textPrimary },
  promoEmoji: { fontSize: fscale(32) },
});

export default HomeScreen;
