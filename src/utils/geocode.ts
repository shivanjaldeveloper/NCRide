// Tiered geocoding, now on Places API (New) — Google's current-generation
// Places endpoints (places.googleapis.com/v1/...), which is what's actually
// enabled on the new key (Maps SDK for Android + Places API (New)). The old
// legacy REST endpoints (maps.googleapis.com/maps/api/place/*,
// maps.googleapis.com/maps/api/geocode/*) are a DIFFERENT product and will
// return REQUEST_DENIED on this key, so they're gone from this file.
//
//   1. Places Autocomplete (New) — fast, cheap, session-less text
//      predictions as the user types. Returns placeId + text only (no
//      lat/lng) by design — that's what keeps it fast. Call
//      `getPlaceDetails(placeId)` once the user actually picks a result.
//   2. Places Nearby Search (New), rankPreference=DISTANCE — used for
//      reverse-geocoding a dragged pin/GPS fix into a human-readable label
//      (closest thing to "what building am I standing at" without a
//      separately-billed Geocoding API key).
//   3. Nominatim (OpenStreetMap) — free, no key, last-resort fallback if
//      Places API (New) is unreachable/quota'd out.
//
// Every tier is wrapped in try/catch and checked for a real result, so if a
// tier is down we silently fall through — this never throws.
import {
  GOOGLE_MAPS_API_KEY,
  PLACES_API_BASE,
  PLACES_REGION_CODE,
  PLACES_LANGUAGE,
} from '../constants/mapsConfig';

// Every tier below fails silently on purpose (so one dead tier never blocks
// the others) but that made "why is nothing showing up" impossible to
// debug from the outside. This logs the real reason to the JS/logcat
// console in dev builds only.
const logTierIssue = (tier: string, detail: string) => {
  if (__DEV__) {
    console.warn(`[geocode] ${tier} → ${detail}`);
  }
};

// Plain info-level logging (visible via `npx react-native log-android`) for
// every request going out and every response coming back — added purely for
// debugging, doesn't change any behavior.
const logInfo = (tier: string, detail: string) => {
  if (__DEV__) {
    console.log(`[geocode] ${tier} → ${detail}`);
  }
};

export type GeocodedPlace = {
  address: string; // full address — shown in picker card
  shortName: string; // building / road / landmark-level label — shown in pill & FROM row
  lat: number;
  lng: number;
};

// Autocomplete (New) intentionally does NOT return coordinates — only a
// placeId + display text. `lat`/`lng` stay 0 until `getPlaceDetails` is
// called for the selected row (see LocationPickerScreen's
// handleSelectSuggestion). This is the standard fast-autocomplete pattern:
// keystroke-by-keystroke predictions are cheap, full place details are only
// fetched once, on selection.
export type PlaceSuggestion = GeocodedPlace & { id: string };

const dedupJoin = (parts: Array<string | undefined | null>) =>
  parts
    .filter((v): v is string => !!v && v.trim().length > 0)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(', ');

const placesHeaders = (fieldMask?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
  };
  if (fieldMask) headers['X-Goog-FieldMask'] = fieldMask;
  return headers;
};

// ── Tier 1a (search): Places Autocomplete (New) ──────────────────────────
// Fast, session-less predictions biased toward wherever the map currently
// is. Field mask isn't needed here — Autocomplete (New) always returns the
// lightweight prediction shape.
const tryPlacesAutocompleteNew = async (
  query: string,
  bias?: { lat: number; lng: number },
): Promise<PlaceSuggestion[]> => {
  try {
    const body: Record<string, unknown> = {
      input: query,
      languageCode: PLACES_LANGUAGE,
      includedRegionCodes: [PLACES_REGION_CODE],
    };
    if (bias) {
      body.locationBias = {
        circle: {
          center: { latitude: bias.lat, longitude: bias.lng },
          radius: 25000,
        },
      };
    }
    logInfo(
      'placesAutocompleteNew',
      `REQUEST → query="${query}", bias=${
        bias ? `${bias.lat},${bias.lng}` : 'none'
      }`,
    );
    const res = await fetch(`${PLACES_API_BASE}/places:autocomplete`, {
      method: 'POST',
      headers: placesHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    logInfo(
      'placesAutocompleteNew',
      `RESPONSE ← http=${res.status}, raw=${JSON.stringify(json)}`,
    );
    if (json.error) {
      logTierIssue(
        'placesAutocompleteNew',
        `${json.error.status ?? res.status} — ${
          json.error.message ?? 'unknown error'
        }`,
      );
      return [];
    }
    const suggestions = Array.isArray(json.suggestions) ? json.suggestions : [];
    const mapped: PlaceSuggestion[] = suggestions
      .map((s: any) => s.placePrediction)
      .filter(Boolean)
      .slice(0, 8)
      .map((p: any): PlaceSuggestion => {
        const mainText = p.structuredFormat?.mainText?.text;
        const secondaryText = p.structuredFormat?.secondaryText?.text;
        const fullText = p.text?.text;
        return {
          id: p.placeId,
          shortName: mainText || fullText || query,
          address: fullText || dedupJoin([mainText, secondaryText]) || query,
          lat: 0,
          lng: 0,
        };
      });
    logInfo(
      'placesAutocompleteNew',
      `mapped ${mapped.length} suggestion(s): ${mapped
        .map(m => m.shortName)
        .join(' | ')}`,
    );
    return mapped;
  } catch (e) {
    logTierIssue('placesAutocompleteNew', `network error — ${e}`);
  }
  return [];
};

// ── Tier 1b (reverse): Places Nearby Search (New), rankPreference=DISTANCE
// Closest analogue to legacy Nearby Search — returns real POI/building
// names near the exact coordinate. The pin's own lat/lng is always kept
// as-is (we only use this to label the point, never to move it).
const tryPlacesNearbyNew = async (
  lat: number,
  lng: number,
): Promise<GeocodedPlace | null> => {
  try {
    const body = {
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 60 },
      },
      rankPreference: 'DISTANCE',
      maxResultCount: 5,
      languageCode: PLACES_LANGUAGE,
      regionCode: PLACES_REGION_CODE,
    };
    logInfo('placesNearbyNew', `REQUEST → lat=${lat}, lng=${lng}`);
    const res = await fetch(`${PLACES_API_BASE}/places:searchNearby`, {
      method: 'POST',
      headers: placesHeaders(
        'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location',
      ),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    logInfo(
      'placesNearbyNew',
      `RESPONSE ← http=${res.status}, resultCount=${
        Array.isArray(json.places) ? json.places.length : 0
      }, raw=${JSON.stringify(json)}`,
    );
    if (json.error) {
      logTierIssue(
        'placesNearbyNew',
        `${json.error.status ?? res.status} — ${
          json.error.message ?? 'unknown error'
        }`,
      );
      return null;
    }
    if (Array.isArray(json.places) && json.places.length > 0) {
      const p = json.places[0];
      const name: string | undefined = p.displayName?.text;
      const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const shortName =
        name ||
        p.shortFormattedAddress?.split(',')[0] ||
        p.formattedAddress?.split(',')[0] ||
        coordLabel;
      const address =
        dedupJoin([name, p.formattedAddress]) ||
        p.formattedAddress ||
        shortName;
      logInfo(
        'placesNearbyNew',
        `SELECTED "${shortName}" address="${address}"`,
      );
      // Deliberately return the ORIGINAL lat/lng (the dropped pin's exact
      // spot), not the matched place's own coordinate.
      return { address, shortName, lat, lng };
    }
    logTierIssue('placesNearbyNew', 'ZERO_RESULTS — no place within range');
  } catch (e) {
    logTierIssue('placesNearbyNew', `network error — ${e}`);
  }
  return null;
};

// ── Place Details (New) — resolves an autocomplete prediction's placeId
// into real coordinates + a clean address, the moment the user taps it. ──
export const getPlaceDetails = async (
  placeId: string,
): Promise<GeocodedPlace | null> => {
  try {
    logInfo('placeDetailsNew', `REQUEST → placeId=${placeId}`);
    const res = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
      method: 'GET',
      headers: placesHeaders(
        'id,displayName,formattedAddress,shortFormattedAddress,location',
      ),
    });
    const json = await res.json();
    logInfo(
      'placeDetailsNew',
      `RESPONSE ← http=${res.status}, raw=${JSON.stringify(json)}`,
    );
    if (json.error) {
      logTierIssue(
        'placeDetailsNew',
        `${json.error.status ?? res.status} — ${
          json.error.message ?? 'unknown error'
        }`,
      );
      return null;
    }
    if (json.location) {
      const name: string | undefined = json.displayName?.text;
      const coordLabel = `${json.location.latitude.toFixed(
        5,
      )}, ${json.location.longitude.toFixed(5)}`;
      const shortName =
        name ||
        json.shortFormattedAddress?.split(',')[0] ||
        json.formattedAddress?.split(',')[0] ||
        coordLabel;
      const address =
        dedupJoin([name, json.formattedAddress]) ||
        json.formattedAddress ||
        shortName;
      return {
        address,
        shortName,
        lat: json.location.latitude,
        lng: json.location.longitude,
      };
    }
    logTierIssue('placeDetailsNew', 'response had no location field');
  } catch (e) {
    logTierIssue('placeDetailsNew', `network error — ${e}`);
  }
  return null;
};

// ── Tier 2: Nominatim (OpenStreetMap) — free, no key, last-resort ────────
const parseNominatimResult = (json: any): GeocodedPlace | null => {
  if (!json?.display_name) return null;
  const a = json.address ?? {};
  const lat = parseFloat(json.lat);
  const lng = parseFloat(json.lon);

  const landmark: string | undefined =
    json.namedetails?.name ||
    a.building ||
    a.amenity ||
    a.shop ||
    a.office ||
    a.tourism ||
    a.leisure ||
    a.house_name;

  const houseNumber: string | undefined = a.house_number;
  const road: string | undefined = a.road;
  const streetLine =
    houseNumber && road ? `${houseNumber}, ${road}` : road || houseNumber;

  const locality: string | undefined =
    a.suburb ||
    a.neighbourhood ||
    a.residential ||
    a.quarter ||
    a.city_district;
  const city: string | undefined = a.city || a.town || a.village || a.county;
  const state: string | undefined = a.state;

  const shortName =
    landmark || streetLine || locality || json.display_name.split(',')[0];

  const address = dedupJoin([landmark, streetLine, locality, city, state]);

  return {
    address: address || json.display_name,
    shortName,
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
  };
};

const tryNominatimReverse = async (
  lat: number,
  lng: number,
): Promise<GeocodedPlace | null> => {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${lat}&lon=${lng}&format=json&addressdetails=1&namedetails=1` +
      `&zoom=18&accept-language=en`;
    logInfo('nominatimReverse', `REQUEST → lat=${lat}, lng=${lng}`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AloAloApp/1.0 ride-hailing' },
    });
    if (res.ok) {
      const json = await res.json();
      const parsed = parseNominatimResult(json);
      if (parsed) {
        logInfo(
          'nominatimReverse',
          `SELECTED address="${parsed.address}" shortName="${parsed.shortName}"`,
        );
        return { ...parsed, lat, lng };
      }
      logTierIssue('nominatimReverse', 'no display_name in response');
    } else {
      logTierIssue('nominatimReverse', `HTTP ${res.status}`);
    }
  } catch (e) {
    logTierIssue('nominatimReverse', `network error — ${e}`);
  }
  return null;
};

const tryNominatimSearch = async (
  query: string,
  bias?: { lat: number; lng: number },
): Promise<PlaceSuggestion[]> => {
  try {
    const viewbox = bias
      ? `&viewbox=${bias.lng - 0.25},${bias.lat + 0.25},${bias.lng + 0.25},${
          bias.lat - 0.25
        }&bounded=0`
      : '';
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(
        query,
      )}&format=json&addressdetails=1&namedetails=1` +
      `&countrycodes=in&limit=8${viewbox}&accept-language=en`;
    logInfo('nominatimSearch', `REQUEST → query="${query}"`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AloAloApp/1.0 ride-hailing' },
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const mapped = json
          .map((item: any, i: number) => {
            const parsed = parseNominatimResult(item);
            return parsed
              ? { ...parsed, id: `nom-${item.place_id ?? i}` }
              : null;
          })
          .filter((v: PlaceSuggestion | null): v is PlaceSuggestion => !!v);
        logInfo(
          'nominatimSearch',
          `mapped ${mapped.length} suggestion(s): ${mapped
            .map(m => m.shortName)
            .join(' | ')}`,
        );
        return mapped;
      }
      logTierIssue('nominatimSearch', `ZERO_RESULTS for "${query}"`);
    } else {
      logTierIssue('nominatimSearch', `HTTP ${res.status}`);
    }
  } catch (e) {
    logTierIssue('nominatimSearch', `network error — ${e}`);
  }
  return [];
};

// ── Public API ─────────────────────────────────────────────────────────────
export const reverseGeocode = async (
  lat: number,
  lng: number,
): Promise<GeocodedPlace> => {
  logInfo('reverseGeocode', `START lat=${lat}, lng=${lng}`);

  const nearby = await tryPlacesNearbyNew(lat, lng);
  if (nearby) {
    logInfo('reverseGeocode', `RESOLVED via placesNearbyNew`);
    return nearby;
  }

  const nominatim = await tryNominatimReverse(lat, lng);
  if (nominatim) {
    logInfo('reverseGeocode', `RESOLVED via nominatimReverse`);
    return nominatim;
  }

  const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  logInfo(
    'reverseGeocode',
    `ALL TIERS FAILED — falling back to raw coordinates "${coordLabel}"`,
  );
  return {
    address: coordLabel,
    shortName: coordLabel,
    lat,
    lng,
  };
};

// Forward search (autocomplete-style) for the location picker's search bar.
// Returns fast text-only predictions (no coordinates) — call
// `getPlaceDetails(suggestion.id)` once the user taps a row to resolve the
// real lat/lng before dropping the pin there.
export const searchPlaces = async (
  query: string,
  bias?: { lat: number; lng: number },
): Promise<PlaceSuggestion[]> => {
  const q = query.trim();
  logInfo('searchPlaces', `START query="${query}" (trimmed="${q}")`);
  if (q.length < 2) {
    logInfo('searchPlaces', 'query too short (<2 chars) — skipping search');
    return [];
  }

  const places = await tryPlacesAutocompleteNew(q, bias);
  if (places.length > 0) {
    logInfo(
      'searchPlaces',
      `RESOLVED via placesAutocompleteNew → ${places.length} result(s)`,
    );
    return places;
  }

  const nominatim = await tryNominatimSearch(q, bias);
  if (nominatim.length > 0) {
    logInfo(
      'searchPlaces',
      `RESOLVED via nominatimSearch → ${nominatim.length} result(s)`,
    );
    return nominatim;
  }

  logInfo('searchPlaces', `ALL TIERS FAILED — no results for "${q}"`);
  return [];
};
