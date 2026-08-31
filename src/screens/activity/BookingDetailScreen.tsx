import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell, HeaderBack } from '../../components/layout';
import { NCCard, Icon, Row } from '../../components/common';
import { MapView } from '../../components/map';
import { Colors, Spacing, fscale, Radii } from '../../theme';
import { getSessionCookie } from '../../utils/auth';
import { decodePolyline } from '../../utils/polyline';
import { useTranslation } from '../../i18n';
import {
  getRideStatus,
  isRideApiError,
  isCompletedStatus,
  isTerminalFailureStatus,
  type RideStatusResponse,
} from '../../services/rideApi';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

const shortAddr = (addr: string): string => addr.split(',')[0].trim() || addr;

const money = (amount?: string, text?: string): string => {
  if (text) return text;
  if (!amount) return '₹ 0';
  return `₹ ${amount}`;
};

const statusChip = (
  status: string,
): { label: string; color: string; bg: string } => {
  if (isCompletedStatus(status))
    return { label: 'Completed', color: Colors.green, bg: '#E9F8E4' };
  if (isTerminalFailureStatus(status))
    return { label: 'Cancelled', color: Colors.red, bg: '#FBEAE9' };
  const label = status
    ? status.charAt(0) + status.slice(1).toLowerCase()
    : 'In progress';
  return { label, color: Colors.blue, bg: '#E8F1FF' };
};

const BookingDetailScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { rideTran, title: initialTitle, icon } = route.params;

  const [detail, setDetail] = useState<RideStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cookie = await getSessionCookie();
      if (!cookie) {
        setError(t.activity.detailLoadError);
        return;
      }
      const res = await getRideStatus({ cookie, rideTran });
      setDetail(res);
    } catch (err) {
      setError(isRideApiError(err) ? err.message : t.activity.detailLoadError);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideTran]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const title = detail
    ? `${shortAddr(detail.Pickup.Address)} → ${shortAddr(detail.Drop.Address)}`
    : initialTitle ?? '';
  const chip = statusChip(detail?.Status ?? '');
  const routeCoords = detail?.Route.EncodedPolyline
    ? decodePolyline(detail.Route.EncodedPolyline)
    : [];

  return (
    <ScreenShell>
      <HeaderBack
        title={t.activity.detailTitle}
        sub={`#${rideTran.slice(0, 10)}`}
        onBack={() => navigation.goBack()}
        right={
          <View style={styles.shareBtn}>
            <Icon name="link" size={18} stroke={Colors.ink} />
          </View>
        }
      />

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={Colors.ink} />
        </View>
      ) : error || !detail ? (
        <View style={styles.centerFill}>
          <Icon name="close" size={22} stroke={Colors.red} />
          <Text style={styles.centerText}>
            {error ?? t.activity.detailLoadError}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.8}
            onPress={loadDetail}
          >
            <Text style={styles.retryText}>{t.activity.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Main summary card ─────────────────────────────── */}
          <NCCard>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Icon name={icon ?? 'car'} size={22} stroke={Colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={styles.summarySub}>{detail.VehicleType}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
                <Text style={[styles.statusText, { color: chip.color }]}>
                  {chip.label}
                </Text>
              </View>
            </View>

            {/* Amount row */}
            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>
                  {isCompletedStatus(detail.Status) ? 'AMOUNT PAID' : 'FARE'}
                </Text>
                <Text style={styles.amountVal}>
                  {money(detail.Fare.FinalFare, detail.Fare.FinalFareText)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountMeta}>
                  {detail.Route.DistanceKM} km · {detail.Route.DurationMinutes}{' '}
                  min
                </Text>
              </View>
            </View>
          </NCCard>

          {/* ── Route map ─────────────────────────────────────── */}
          {routeCoords.length > 1 && (
            <NCCard style={styles.mapCard} pad={0}>
              <MapView
                height={fscale(160)}
                interactive={false}
                showControls={false}
                pickupCoord={{
                  latitude: Number(detail.Pickup.Latitude),
                  longitude: Number(detail.Pickup.Longitude),
                }}
                dropCoord={{
                  latitude: Number(detail.Drop.Latitude),
                  longitude: Number(detail.Drop.Longitude),
                }}
                externalRouteCoords={routeCoords}
                externalRouteOnly
                routeColor={detail.Route.PolylineColor}
                routeWidth={Number(detail.Route.PolylineWidth) || undefined}
                style={styles.map}
              />
            </NCCard>
          )}

          {/* ── Trip info ─────────────────────────────────────── */}
          <NCCard style={styles.card}>
            <Text style={styles.sectionLabel}>TRIP INFO</Text>
            <Row icon="pin" title="Pickup" sub={detail.Pickup.Address} />
            <Row icon="pinFill" title="Drop" sub={detail.Drop.Address} />
            {detail.Driver && (
              <>
                <Row
                  icon="user"
                  title="Driver"
                  sub={`${detail.Driver.Name} · ${detail.Driver.Mobile}`}
                />
                <Row
                  icon="taxi"
                  title="Vehicle"
                  sub={`${detail.Driver.VehicleModel} · ${detail.Driver.VehicleNumber}`}
                />
              </>
            )}
          </NCCard>

          {/* ── Fare breakup ─────────────────────────────────── */}
          <NCCard style={styles.card}>
            <Text style={styles.sectionLabel}>FARE BREAKUP</Text>
            {[
              [
                'Original fare',
                money(detail.Fare.OriginalFare, detail.Fare.OriginalFareText),
              ],
              ...(Number(detail.Fare.DiscountAmount) > 0
                ? [
                    [
                      `Discount${
                        detail.Fare.DiscountPercentage
                          ? ` · ${detail.Fare.DiscountPercentage}%`
                          : ''
                      }`,
                      `−${money(
                        detail.Fare.DiscountAmount,
                        detail.Fare.DiscountAmountText,
                      )}`,
                    ],
                  ]
                : []),
              ...(detail.Fare.SurgeApplied === 'YES'
                ? [
                    [
                      `Surge${
                        detail.Fare.SurgeMultiplier
                          ? ` · ${detail.Fare.SurgeMultiplier}x`
                          : ''
                      }`,
                      money(
                        detail.Fare.SurgeAmount,
                        detail.Fare.SurgeAmountText,
                      ),
                    ],
                  ]
                : []),
            ].map(([k, v]) => (
              <View key={k} style={styles.fareRow}>
                <Text
                  style={[
                    styles.fareKey,
                    k.startsWith('Discount') && { color: Colors.green },
                  ]}
                >
                  {k}
                </Text>
                <Text
                  style={[
                    styles.fareVal,
                    k.startsWith('Discount') && { color: Colors.green },
                  ]}
                >
                  {v}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {isCompletedStatus(detail.Status) ? 'Total paid' : 'Total fare'}
              </Text>
              <Text style={styles.totalVal}>
                {money(detail.Fare.FinalFare, detail.Fare.FinalFareText)}
              </Text>
            </View>
          </NCCard>

          {/* ── Ratings ───────────────────────────────────────── */}
          {!!detail.Rating && (
            <NCCard style={styles.card}>
              <Text style={styles.sectionLabel}>RATINGS</Text>
              {!!detail.Rating.ByCustomer && (
                <Row
                  icon="starFill"
                  iconColor={Colors.amber}
                  title="You rated the driver"
                  sub={detail.Rating.ByCustomerComment || undefined}
                  right={
                    <Text style={styles.ratingValue}>
                      {detail.Rating.ByCustomer}
                    </Text>
                  }
                />
              )}
              {!!detail.Rating.ByPartner && (
                <Row
                  icon="starFill"
                  iconColor={Colors.amber}
                  title="Driver rated you"
                  sub={detail.Rating.ByPartnerComment || undefined}
                  right={
                    <Text style={styles.ratingValue}>
                      {detail.Rating.ByPartner}
                    </Text>
                  }
                />
              )}
            </NCCard>
          )}

          {/* ── Actions ───────────────────────────────────────── */}
          {isCompletedStatus(detail.Status) && (
            <NCCard style={styles.card}>
              <Text style={styles.sectionLabel}>ACTIONS</Text>
              <Row
                icon="invoice"
                title="Download invoice"
                onPress={() => navigation.navigate('InvoiceReceipt')}
              />
            </NCCard>
          )}
        </ScrollView>
      )}
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: fscale(40),
  },

  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: fscale(10),
    paddingHorizontal: Spacing.screen * 2,
  },
  centerText: {
    fontSize: fscale(13),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: fscale(4),
    paddingHorizontal: fscale(20),
    paddingVertical: fscale(10),
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
  },
  retryText: { fontSize: fscale(13), fontWeight: '700', color: '#fff' },

  shareBtn: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: Radii.lg,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryIcon: {
    width: fscale(44),
    height: fscale(44),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: fscale(14),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
    flex: 1,
  },
  summarySub: {
    fontSize: fscale(11.5),
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: fscale(8),
    paddingVertical: fscale(4),
    borderRadius: Radii.sm,
  },
  statusText: { fontSize: fscale(11), fontWeight: '700' },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(15,17,21,0.06)',
  },
  amountLabel: {
    fontSize: fscale(10.5),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  amountVal: {
    fontSize: fscale(28),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  amountMeta: { fontSize: fscale(11.5), color: Colors.textSecondary },

  card: { marginTop: Spacing.md },
  mapCard: { marginTop: Spacing.md, overflow: 'hidden' },
  map: { borderRadius: Radii.xxl },

  sectionLabel: {
    fontSize: fscale(11),
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: fscale(5),
  },
  fareKey: { fontSize: fscale(13), color: Colors.textSecondary },
  fareVal: { fontSize: fscale(13), fontWeight: '600', color: Colors.ink },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(15,17,21,0.08)',
  },
  totalLabel: { fontSize: fscale(14), fontWeight: '700', color: Colors.ink },
  totalVal: {
    fontSize: fscale(16),
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  ratingValue: {
    fontSize: fscale(14),
    fontWeight: '800',
    color: Colors.ink,
  },
});

export default BookingDetailScreen;
