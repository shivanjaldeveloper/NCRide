import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Animated,
} from 'react-native';
import RNMapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, fscale, vscale, Radii, Shadows } from '../../theme';
import { Icon } from '../../components/common';
import { reverseGeocode, searchPlaces } from '../../utils/geocode';
import type { PlaceSuggestion } from '../../utils/geocode';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPicker'>;

const SEARCH_DEBOUNCE_MS = 350;
const GEOCODE_DEBOUNCE_MS = 400;
const REGION_DELTA = 0.008;
// "Good enough" GPS accuracy (metres) to stop auto-refining and lock in.
const GOOD_ACCURACY_M = 15;

const LocationPickerScreen = ({ navigation, route }: Props) => {
  const {
    field,
    initialLat,
    initialLng,
    initialAddress,
    initialSource,
    onPick,
  } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RNMapView>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // True once the user has done anything deliberate (dragged the map,
  // searched, picked a suggestion). Stops the background GPS auto-refine
  // below from clobbering a choice the user already made mid-flight.
  const userInteractedRef = useRef(false);
  const sourceRef = useRef<'gps' | 'manual'>(initialSource ?? 'manual');
  // Whether this screen-open should try to auto-resolve the user's live GPS
  // fix on its own (like the reference "confirm location" flow, which lands
  // the pin on your real position the moment the map opens). Only skipped
  // when we were opened to EDIT an already-chosen point — a fresh open
  // (no initial coords) always tries for a real fix, for both pickup and
  // dropoff, instead of the old pickup-only behaviour.
  const autoLocateRef = useRef(!(initialLat && initialLng));
  // The freshest fix seen from the map's own blue-dot, kept live for the
  // whole time this screen is open — "Use current location" just reads
  // whatever is here rather than needing a separate native GPS call.
  const liveFixRef = useRef<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const bestAutoAccuracyRef = useRef<number>(Number.MAX_SAFE_INTEGER);
  const autoRefineLockedRef = useRef(initialSource === 'manual');
  const pendingUseCurrentRef = useRef(false);

  const [address, setAddress] = useState(
    initialAddress ?? 'Move map to select',
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
  );
  const [geocoding, setGeocoding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fetchingCurrent, setFetchingCurrent] = useState(false);
  // GPS accuracy (metres) behind the current pin, when known — shown in the
  // confirm card so it's clear just how precise the pin drop is. Cleared
  // whenever the point comes from a search result or manual drag, since
  // those are exact by definition (no GPS uncertainty to report).
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);

  const pinDrop = useRef(new Animated.Value(1)).current;
  const bouncePinDrop = useCallback(() => {
    pinDrop.setValue(0.6);
    Animated.spring(pinDrop, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [pinDrop]);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  // Measured height of the bottom card, used to float the "Use current
  // location" pill just above it regardless of how tall the address text
  // wraps to.
  const [cardHeight, setCardHeight] = useState(0);

  const isPickup = field === 'pickup';
  const accentColor = isPickup ? Colors.green : Colors.blue;
  const accentBg = isPickup ? '#E8FFF0' : '#EEF4FF';
  const showDropdown = focused;

  // ── Debounced search-as-you-type ─────────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    console.log(`[LocationPicker] search debounce fired for query="${q}"`);
    searchTimer.current = setTimeout(async () => {
      console.log(
        `[LocationPicker] calling searchPlaces("${q}") bias=${JSON.stringify(
          coords,
        )}`,
      );
      const results = await searchPlaces(q, coords ?? undefined);
      console.log(
        `[LocationPicker] searchPlaces("${q}") returned ${
          results.length
        } result(s): ${JSON.stringify(results)}`,
      );
      setSuggestions(results);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const closeDropdown = useCallback(() => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(false);
    Keyboard.dismiss();
  }, []);

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
  };
  // Small delay so a tap on a suggestion row registers before the dropdown
  // unmounts — otherwise blur fires first and swallows the tap.
  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setFocused(false), 150);
  };

  const recenterMap = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: REGION_DELTA,
        longitudeDelta: REGION_DELTA,
      },
      600,
    );
  };

  // Coordinate-only update (from GPS or drag) — needs a reverse-geocode
  // round trip to resolve into an address.
  const scheduleGeocode = useCallback(
    (lat: number, lng: number, accuracy?: number) => {
      console.log(
        `[LocationPicker] scheduleGeocode lat=${lat}, lng=${lng}, accuracy=${accuracy}`,
      );
      setCoords({ lat, lng });
      setAccuracyMeters(accuracy ?? null);
      bouncePinDrop();
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      setGeocoding(true);
      geocodeTimer.current = setTimeout(async () => {
        try {
          console.log(
            `[LocationPicker] calling reverseGeocode(${lat}, ${lng})`,
          );
          const place = await reverseGeocode(lat, lng);
          console.log(
            `[LocationPicker] reverseGeocode(${lat}, ${lng}) resolved → ${JSON.stringify(
              place,
            )}`,
          );
          setAddress(place.address);
        } finally {
          setGeocoding(false);
        }
      }, GEOCODE_DEBOUNCE_MS);
    },
    [bouncePinDrop],
  );

  // Search result — address is already known, no geocoding needed.
  const jumpToKnownAddress = (
    lat: number,
    lng: number,
    nextAddress: string,
  ) => {
    console.log(
      `[LocationPicker] jumpToKnownAddress lat=${lat}, lng=${lng}, address="${nextAddress}"`,
    );
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    setGeocoding(false);
    setCoords({ lat, lng });
    setAddress(nextAddress);
    setAccuracyMeters(null); // an exact, chosen point — no GPS uncertainty to show
    bouncePinDrop();
    recenterMap(lat, lng);
  };

  // ── Live blue-dot tracking — this is what replaces a native Geolocation
  // call. react-native-maps reports `accuracy` (metres) on both platforms
  // for every `onUserLocationChange` event; the first ping is often a
  // coarse/cached fix, so we keep listening and only act on genuine
  // improvements instead of freezing on the first one. ────────────────────
  const onUserLocationChange = useCallback(
    (event: any) => {
      const { coordinate } = event.nativeEvent;
      console.log(
        `[LocationPicker] onUserLocationChange RAW nativeEvent.coordinate = ${JSON.stringify(
          coordinate,
        )}`,
      );
      if (!coordinate) return;
      const accuracy: number =
        typeof coordinate.accuracy === 'number'
          ? coordinate.accuracy
          : Number.MAX_SAFE_INTEGER;
      const lat = coordinate.latitude;
      const lng = coordinate.longitude;

      if (!liveFixRef.current || accuracy < liveFixRef.current.accuracy) {
        liveFixRef.current = { lat, lng, accuracy };
        console.log(
          `[LocationPicker] liveFixRef updated → lat=${lat}, lng=${lng}, accuracy=${accuracy}`,
        );
      }

      // "Use current location" was tapped before any fix was available —
      // resolve it now with the first one that arrives.
      if (pendingUseCurrentRef.current) {
        console.log(
          `[LocationPicker] resolving pending "use current location" with fix lat=${lat}, lng=${lng}, accuracy=${accuracy}`,
        );
        pendingUseCurrentRef.current = false;
        setFetchingCurrent(false);
        sourceRef.current = 'gps';
        userInteractedRef.current = true;
        recenterMap(lat, lng);
        scheduleGeocode(lat, lng, accuracy);
        return;
      }

      // Auto-refine toward a more accurate fix on open, but only until the
      // user does something themselves or we hit a good fix. Runs for both
      // pickup and dropoff whenever the screen opened without a pre-chosen
      // point, so the map always lands on your real location first — same
      // as the reference "confirm location" flow.
      if (
        autoLocateRef.current &&
        !userInteractedRef.current &&
        !autoRefineLockedRef.current &&
        accuracy < bestAutoAccuracyRef.current
      ) {
        bestAutoAccuracyRef.current = accuracy;
        sourceRef.current = 'gps';
        console.log(
          `[LocationPicker] auto-refine → new best accuracy=${accuracy}m at lat=${lat}, lng=${lng}`,
        );
        recenterMap(lat, lng);
        scheduleGeocode(lat, lng, accuracy);
        if (accuracy <= GOOD_ACCURACY_M) {
          autoRefineLockedRef.current = true;
          console.log(
            `[LocationPicker] auto-refine locked — accuracy=${accuracy}m <= GOOD_ACCURACY_M=${GOOD_ACCURACY_M}m`,
          );
        }
      }
    },
    [scheduleGeocode],
  );

  const handleSelectSuggestion = (item: PlaceSuggestion) => {
    console.log(
      `[LocationPicker] handleSelectSuggestion → ${JSON.stringify(item)}`,
    );
    userInteractedRef.current = true;
    autoRefineLockedRef.current = true;
    sourceRef.current = 'manual';
    setQuery('');
    setSuggestions([]);
    closeDropdown();
    jumpToKnownAddress(item.lat, item.lng, item.address);
  };

  const handleUseCurrentLocation = () => {
    console.log(
      `[LocationPicker] handleUseCurrentLocation tapped, liveFixRef=${JSON.stringify(
        liveFixRef.current,
      )}`,
    );
    userInteractedRef.current = true;
    autoRefineLockedRef.current = true; // this action supersedes the auto-refine flow
    setQuery('');
    setSuggestions([]);
    closeDropdown();
    if (liveFixRef.current) {
      const { lat, lng, accuracy } = liveFixRef.current;
      sourceRef.current = 'gps';
      recenterMap(lat, lng);
      scheduleGeocode(lat, lng, accuracy);
    } else {
      console.log(
        '[LocationPicker] no live fix yet — waiting for GPS (max 8s)',
      );
      // No fix yet (e.g. cold GPS start) — show a spinner and resolve as
      // soon as onUserLocationChange fires above. Give up after a few
      // seconds rather than spinning forever if GPS/permission never
      // comes through.
      setFetchingCurrent(true);
      pendingUseCurrentRef.current = true;
      setTimeout(() => {
        if (pendingUseCurrentRef.current) {
          pendingUseCurrentRef.current = false;
          setFetchingCurrent(false);
        }
      }, 8000);
    }
  };

  const onRegionChange = useCallback(() => {
    userInteractedRef.current = true;
    autoRefineLockedRef.current = true;
    sourceRef.current = 'manual';
    setDragging(true);
  }, []);

  // Debounced reverse geocode when user stops panning
  const onRegionChangeComplete = useCallback(
    (region: Region) => {
      console.log(
        `[LocationPicker] onRegionChangeComplete RAW region = ${JSON.stringify(
          region,
        )}`,
      );
      setDragging(false);
      scheduleGeocode(region.latitude, region.longitude);
    },
    [scheduleGeocode],
  );

  const handleConfirm = () => {
    if (!coords) return;
    console.log(
      `[LocationPicker] handleConfirm → address="${address}", coords=${JSON.stringify(
        coords,
      )}, accuracy=${accuracyMeters}, source=${sourceRef.current}`,
    );
    onPick({
      address,
      lat: coords.lat,
      lng: coords.lng,
      accuracy: accuracyMeters ?? undefined,
      source: sourceRef.current,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      {/* Full-screen interactive map */}
      <RNMapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={
          initialLat && initialLng
            ? {
                latitude: initialLat,
                longitude: initialLng,
                latitudeDelta: REGION_DELTA,
                longitudeDelta: REGION_DELTA,
              }
            : undefined
        }
        onTouchStart={closeDropdown}
        onUserLocationChange={onUserLocationChange}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
      />

      {/* Callout above the pin — hidden while the search dropdown is open so
          it doesn't collide with the results list */}
      {!showDropdown && (
        <View style={styles.tooltipWrap} pointerEvents="none">
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>
              {isPickup ? "You'll be picked up here" : "You'll be dropped here"}
            </Text>
            <Text style={styles.tooltipSub}>
              Move pin to your exact location
            </Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}

      {/* Fixed center pin — pointer-events none so map stays interactive */}
      <View style={styles.pinWrap} pointerEvents="none">
        {/* Shadow shrinks when lifted */}
        <View style={[styles.pinShadow, dragging && styles.pinShadowSmall]} />
        {/* Pin lifts up while dragging, and bounces when it settles on a
            new coordinate (GPS refine, search pick, or drag release) */}
        <Animated.View
          style={[
            styles.pin,
            {
              backgroundColor: accentColor,
              transform: [
                { translateY: dragging ? -fscale(6) : 0 },
                { scale: pinDrop },
              ],
            },
          ]}
        >
          <Icon
            name={isPickup ? 'locate' : 'pin'}
            size={18}
            stroke="#fff"
            sw={2}
          />
        </Animated.View>
      </View>

      {/* Header with search */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevronLeft" size={20} stroke={Colors.ink} sw={2} />
          </TouchableOpacity>
          <View style={styles.searchBox}>
            <Icon name="search" size={14} stroke={Colors.textTertiary} sw={2} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={
                isPickup ? 'Search pickup location' : 'Search destination'
              }
              placeholderTextColor={Colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              onFocus={handleFocus}
              onBlur={handleBlur}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setQuery('')}
              >
                <Icon
                  name="close"
                  size={13}
                  stroke={Colors.textTertiary}
                  sw={2}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!focused && (
          <Text style={styles.headerSub}>
            {isPickup ? 'Set Pickup Point' : 'Choose Destination'} · drag the
            map to fine-tune
          </Text>
        )}
      </View>

      {/* Search / suggestions dropdown */}
      {showDropdown && (
        <View style={[styles.dropdown, { top: insets.top + 66 }]}>
          {query.trim().length >= 2 && searching && (
            <View style={styles.suggestionRow}>
              <ActivityIndicator
                size="small"
                color={Colors.textTertiary}
                style={{ marginLeft: fscale(2) }}
              />
              <Text style={[styles.suggestionSub, { marginLeft: Spacing.md }]}>
                Searching…
              </Text>
            </View>
          )}

          {query.trim().length >= 2 &&
            !searching &&
            suggestions.length === 0 && (
              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionSub}>
                  No matching places found
                </Text>
              </View>
            )}

          {!searching &&
            suggestions.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionRow}
                activeOpacity={0.7}
                onPress={() => handleSelectSuggestion(item)}
              >
                <View style={styles.suggestionIconWrap}>
                  <Icon
                    name="pin"
                    size={14}
                    stroke={Colors.textSecondary}
                    sw={2}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.shortName}
                  </Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Floating "use current location" pill, anchored just above the
          measured card height — hidden while the search dropdown covers
          the map. */}
      {!showDropdown && cardHeight > 0 && (
        <View
          style={[
            styles.currentLocBtnWrap,
            { bottom: cardHeight + vscale(14) },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.currentLocBtn}
            activeOpacity={0.85}
            onPress={handleUseCurrentLocation}
          >
            {fetchingCurrent ? (
              <ActivityIndicator size="small" color={Colors.green} />
            ) : (
              <Icon name="locate" size={15} stroke={Colors.green} sw={2.2} />
            )}
            <Text style={styles.currentLocBtnText}>
              {fetchingCurrent ? 'Locating…' : 'Use current location'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom address card */}
      <View
        style={[styles.card, { paddingBottom: insets.bottom + 16 }]}
        onLayout={e => setCardHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>
            {isPickup
              ? 'Confirm your pickup point'
              : 'Confirm your destination'}
          </Text>
        </View>
        <View style={styles.addressRow}>
          <View style={[styles.dotCircle, { backgroundColor: accentBg }]}>
            <View style={[styles.dot, { backgroundColor: accentColor }]} />
          </View>
          <View style={{ flex: 1 }}>
            {dragging || geocoding ? (
              <View style={styles.geocodingRow}>
                <ActivityIndicator size="small" color={Colors.textTertiary} />
                <Text style={styles.geocodingText}>Locating…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.addressText} numberOfLines={2}>
                  {address}
                </Text>
                {coords && (
                  <Text style={styles.detailText} numberOfLines={1}>
                    {accuracyMeters != null
                      ? `GPS accuracy ~${Math.round(
                          accuracyMeters,
                        )}m · ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(
                          5,
                        )}`
                      : `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
                  </Text>
                )}
              </>
            )}
          </View>
          <TouchableOpacity
            style={styles.changeBtn}
            activeOpacity={0.7}
            onPress={() => searchInputRef.current?.focus()}
          >
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: accentColor },
            (!coords || geocoding || dragging) && styles.confirmBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleConfirm}
          disabled={!coords || geocoding || dragging}
        >
          <Text style={styles.confirmBtnText}>
            {isPickup ? 'Set Pickup Here' : 'Set as Destination'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.map },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.screen,
    paddingBottom: fscale(12),
    backgroundColor: Colors.bgWhite,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backBtn: {
    width: fscale(38),
    height: fscale(38),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: fscale(38),
    paddingHorizontal: fscale(14),
    borderRadius: Radii.md,
    backgroundColor: Colors.bgOffWhite,
  },
  searchInput: {
    flex: 1,
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.ink,
    padding: 0,
  },
  headerTitle: {
    fontSize: fscale(15),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    marginTop: fscale(8),
    marginLeft: fscale(2),
  },

  // Suggestions dropdown
  dropdown: {
    position: 'absolute',
    left: Spacing.screen,
    right: Spacing.screen,
    backgroundColor: Colors.bgWhite,
    borderRadius: Radii.lg,
    paddingVertical: fscale(4),
    maxHeight: vscale(320),
    ...Shadows.strong,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: fscale(11),
  },
  suggestionIconWrap: {
    width: fscale(30),
    height: fscale(30),
    borderRadius: fscale(15),
    backgroundColor: Colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestionTitle: {
    fontSize: fscale(13.5),
    fontWeight: '700',
    color: Colors.ink,
  },
  suggestionSub: {
    fontSize: fscale(11.5),
    color: Colors.textTertiary,
    marginTop: 1,
  },

  // Tooltip callout above the pin
  tooltipWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '50%',
    marginBottom: fscale(46),
    alignItems: 'center',
  },
  tooltipBubble: {
    backgroundColor: 'rgba(15,17,21,0.92)',
    borderRadius: Radii.md,
    paddingHorizontal: fscale(14),
    paddingVertical: fscale(9),
    maxWidth: '76%',
  },
  tooltipText: {
    fontSize: fscale(12.5),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  tooltipSub: {
    fontSize: fscale(11),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 2,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: fscale(6),
    borderRightWidth: fscale(6),
    borderTopWidth: fscale(7),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(15,17,21,0.92)',
    marginTop: -1,
  },

  // Floating "use current location" pill
  currentLocBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgWhite,
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: Radii.pill,
    paddingHorizontal: fscale(16),
    paddingVertical: fscale(9),
    ...Shadows.card,
  },
  currentLocBtnText: {
    fontSize: fscale(13),
    fontWeight: '700',
    color: Colors.green,
  },

  // Center pin
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: fscale(40),
    height: fscale(40),
    borderRadius: fscale(20),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    // accounts for the shadow dot below so the pin circle is centered on the
    // map's actual pick point
    marginBottom: fscale(10),
  },

  pinShadow: {
    position: 'absolute',
    width: fscale(18),
    height: fscale(6),
    borderRadius: fscale(3),
    backgroundColor: 'rgba(0,0,0,0.22)',
    // centre the shadow dot exactly at map centre
    top: '50%',
    marginTop: fscale(16),
  },
  pinShadowSmall: {
    width: fscale(10),
    opacity: 0.12,
    marginTop: fscale(20),
  },

  // Bottom card
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgWhite,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.screen,
    paddingTop: vscale(20),
    ...Shadows.strong,
  },
  cardLabelRow: { marginBottom: vscale(10) },
  cardLabel: {
    fontSize: fscale(12.5),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: vscale(14),
  },
  changeBtn: {
    paddingHorizontal: fscale(12),
    paddingVertical: fscale(6),
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  changeBtnText: {
    fontSize: fscale(12),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dotCircle: {
    width: fscale(36),
    height: fscale(36),
    borderRadius: fscale(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dot: {
    width: fscale(12),
    height: fscale(12),
    borderRadius: fscale(6),
  },
  geocodingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  geocodingText: {
    fontSize: fscale(13),
    color: Colors.textSecondary,
  },
  addressText: {
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: fscale(20),
  },
  detailText: {
    fontSize: fscale(11),
    color: Colors.textTertiary,
    marginTop: 2,
  },
  confirmBtn: {
    borderRadius: Radii.pill,
    paddingVertical: fscale(15),
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: {
    fontSize: fscale(15),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
});

export default LocationPickerScreen;
