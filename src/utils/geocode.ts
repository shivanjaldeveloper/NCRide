// Tiered geocoding — most precise first, cheapest/most-reliable last:
//   1. Google Places (Nearby/Text Search) — real building & business names,
//      the closest thing to "what building am I standing at".
//   2. Google Geocoding API — good street/premise-level address components.
//   3. Nominatim (OpenStreetMap) — free, no key, decent fallback coverage.
// Every tier is wrapped in try/catch and checked for an OK status, so if
// Places/Geocoding aren't enabled on this key (or quota'd out) we silently
// fall through — this never throws and never blocks on a dead tier.
const MAPS_API_KEY = 'AIzaSyAfeyD0QfhlBzVN687FKI2hVHjT1dPeG1I';

// Every tier below fails silently on purpose (so one dead tier never blocks
// the others) but that made "why is nothing showing up" impossible to
// debug from the outside. This logs the real reason to the JS/logcat
// console in dev builds only — e.g. REQUEST_DENIED (key/API restriction),
// ZERO_RESULTS (genuinely nothing found), or a network exception.
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

export type PlaceSuggestion = GeocodedPlace & { id: string };

const dedupJoin = (parts: Array<string | undefined | null>) =>
  parts
    .filter((v): v is string => !!v && v.trim().length > 0)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(', ');

const haversineMeters = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// ── Tier 1a (reverse): nearest named place to the exact coordinate ────────
// Nearby Search returns actual POI/building names ("Cyber Hub", "H-141
// Apartments") that Geocoding APIs generally don't carry — this is the
// biggest lever for "show my building name, not just the sector".
const MAX_NEARBY_DISTANCE_M = 60;

const tryGooglePlacesNearby = async (
  lat: number,
  lng: number,
): Promise<GeocodedPlace | null> => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}&rank_by=distance&key=${MAPS_API_KEY}&language=en`;
    logInfo('placesNearby', `REQUEST → lat=${lat}, lng=${lng}, url=${url}`);
    const res = await fetch(url);
    const json = await res.json();
    logInfo(
      'placesNearby',
      `RESPONSE ← status=${json.status}, resultCount=${
        Array.isArray(json.results) ? json.results.length : 0
      }, raw=${JSON.stringify(json)}`,
    );
    if (json.status === 'OK' && Array.isArray(json.results)) {
      for (const r of json.results.slice(0, 5)) {
        const rl = r.geometry?.location;
        if (!rl || !r.name) continue;
        const dist = haversineMeters(lat, lng, rl.lat, rl.lng);
        logInfo(
          'placesNearby',
          `candidate name="${r.name}" vicinity="${
            r.vicinity
          }" dist=${dist.toFixed(1)}m (max=${MAX_NEARBY_DISTANCE_M}m)`,
        );
        if (dist <= MAX_NEARBY_DISTANCE_M) {
          logInfo(
            'placesNearby',
            `SELECTED "${r.name}" at dist=${dist.toFixed(1)}m`,
          );
          return {
            address: dedupJoin([r.name, r.vicinity]) || r.name,
            shortName: r.name,
            lat,
            lng,
          };
        }
      }
      if (json.results.length === 0) {
        logTierIssue('placesNearby', 'ZERO_RESULTS — no POI within range');
      } else {
        logInfo(
          'placesNearby',
          `no candidate within ${MAX_NEARBY_DISTANCE_M}m — falling through to next tier`,
        );
      }
    } else if (json.status !== 'OK') {
      logTierIssue(
        'placesNearby',
        `${json.status}${json.error_message ? ' — ' + json.error_message : ''}`,
      );
    }
  } catch (e) {
    logTierIssue('placesNearby', `network error — ${e}`);
  }
  return null;
};

// ── Tier 1b (search): free-text places search, biased to the map area ────
const tryGooglePlacesTextSearch = async (
  query: string,
  bias?: { lat: number; lng: number },
): Promise<PlaceSuggestion[]> => {
  try {
    const locationBias = bias
      ? `&location=${bias.lat},${bias.lng}&radius=25000`
      : '';
    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}&key=${MAPS_API_KEY}` +
      `&language=en&region=in${locationBias}`;
    logInfo(
      'placesTextSearch',
      `REQUEST → query="${query}", bias=${
        bias ? `${bias.lat},${bias.lng}` : 'none'
      }, url=${url}`,
    );
    const res = await fetch(url);
    const json = await res.json();
    logInfo(
      'placesTextSearch',
      `RESPONSE ← status=${json.status}, resultCount=${
        Array.isArray(json.results) ? json.results.length : 0
      }, raw=${JSON.stringify(json)}`,
    );
    if (
      json.status === 'OK' &&
      Array.isArray(json.results) &&
      json.results.length
    ) {
      const mapped = json.results.slice(0, 8).map((r: any, i: number) => ({
        address:
          dedupJoin([r.name, r.formatted_address]) || r.formatted_address,
        shortName: r.name || r.formatted_address?.split(',')[0] || query,
        lat: r.geometry?.location?.lat ?? 0,
        lng: r.geometry?.location?.lng ?? 0,
        id: r.place_id ?? `gp-${i}`,
      }));
      logInfo(
        'placesTextSearch',
        `mapped ${mapped.length} suggestion(s): ${mapped
          .map((m: PlaceSuggestion) => m.shortName)
          .join(' | ')}`,
      );
      return mapped;
    }
    if (json.status !== 'OK') {
      logTierIssue(
        'placesTextSearch',
        `${json.status}${json.error_message ? ' — ' + json.error_message : ''}`,
      );
    } else {
      logTierIssue('placesTextSearch', `ZERO_RESULTS for "${query}"`);
    }
  } catch (e) {
    logTierIssue('placesTextSearch', `network error — ${e}`);
  }
  return [];
};

// ── Tier 2: Google Geocoding API ──────────────────────────────────────────
const parseGoogleResult = (result: any): GeocodedPlace => {
  const comps: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }> = result.address_components ?? [];
  const get = (type: string) =>
    comps.find(c => c.types.includes(type))?.long_name ?? '';

  const landmark =
    get('point_of_interest') || get('premise') || get('establishment');
  const streetNumber = get('street_number');
  const route = get('route');
  const streetLine =
    streetNumber && route ? `${streetNumber}, ${route}` : route || streetNumber;
  const locality =
    get('sublocality_level_1') || get('sublocality') || get('neighborhood');
  const city = get('locality') || get('administrative_area_level_2');
  const state = get('administrative_area_level_1');

  const shortName =
    landmark ||
    streetLine ||
    locality ||
    result.formatted_address.split(',')[0];

  const address =
    dedupJoin([landmark, streetLine, locality, city, state]) ||
    result.formatted_address;

  const loc = result.geometry?.location ?? {};
  return { address, shortName, lat: loc.lat ?? 0, lng: loc.lng ?? 0 };
};

const tryGoogleGeocode = async (
  lat: number,
  lng: number,
): Promise<GeocodedPlace | null> => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${lat},${lng}&key=${MAPS_API_KEY}&language=en&result_type=` +
      `street_address|premise|point_of_interest|subpremise`;
    logInfo('geocode(narrow)', `REQUEST → lat=${lat}, lng=${lng}, url=${url}`);
    const res = await fetch(url);
    const json = await res.json();
    logInfo(
      'geocode(narrow)',
      `RESPONSE ← status=${json.status}, resultCount=${
        json.results?.length ?? 0
      }, raw=${JSON.stringify(json)}`,
    );
    if (json.status === 'OK' && json.results?.length > 0) {
      const parsed = { ...parseGoogleResult(json.results[0]), lat, lng };
      logInfo(
        'geocode(narrow)',
        `SELECTED address="${parsed.address}" shortName="${parsed.shortName}"`,
      );
      return parsed;
    }
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
      logTierIssue(
        'geocode(narrow)',
        `${json.status}${json.error_message ? ' — ' + json.error_message : ''}`,
      );
    }
    const broadUrl =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${lat},${lng}&key=${MAPS_API_KEY}&language=en`;
    logInfo(
      'geocode(broad)',
      `REQUEST → lat=${lat}, lng=${lng}, url=${broadUrl}`,
    );
    const broadRes = await fetch(broadUrl);
    const broadJson = await broadRes.json();
    logInfo(
      'geocode(broad)',
      `RESPONSE ← status=${broadJson.status}, resultCount=${
        broadJson.results?.length ?? 0
      }, raw=${JSON.stringify(broadJson)}`,
    );
    if (broadJson.status === 'OK' && broadJson.results?.length > 0) {
      const parsed = { ...parseGoogleResult(broadJson.results[0]), lat, lng };
      logInfo(
        'geocode(broad)',
        `SELECTED address="${parsed.address}" shortName="${parsed.shortName}"`,
      );
      return parsed;
    }
    if (broadJson.status !== 'OK') {
      logTierIssue(
        'geocode(broad)',
        `${broadJson.status}${
          broadJson.error_message ? ' — ' + broadJson.error_message : ''
        }`,
      );
    }
  } catch (e) {
    logTierIssue('geocode', `network error — ${e}`);
  }
  return null;
};

// ── Tier 3: Nominatim (OpenStreetMap) — free, no key ─────────────────────
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
    logInfo('nominatimReverse', `REQUEST → lat=${lat}, lng=${lng}, url=${url}`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AloAloApp/1.0 ride-hailing' },
    });
    logInfo('nominatimReverse', `HTTP status=${res.status}`);
    if (res.ok) {
      const json = await res.json();
      logInfo('nominatimReverse', `RESPONSE ← raw=${JSON.stringify(json)}`);
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
      // Nominatim's public server returns 403/429 if it thinks a client is
      // making too many automated requests (its usage policy explicitly
      // disallows autocomplete-style traffic) — this is the most likely
      // cause if every search comes back empty.
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
    logInfo(
      'nominatimSearch',
      `REQUEST → query="${query}", bias=${
        bias ? `${bias.lat},${bias.lng}` : 'none'
      }, url=${url}`,
    );
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AloAloApp/1.0 ride-hailing' },
    });
    logInfo('nominatimSearch', `HTTP status=${res.status}`);
    if (res.ok) {
      const json = await res.json();
      logInfo(
        'nominatimSearch',
        `RESPONSE ← resultCount=${
          Array.isArray(json) ? json.length : 0
        }, raw=${JSON.stringify(json)}`,
      );
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

  const nearby = await tryGooglePlacesNearby(lat, lng);
  if (nearby) {
    logInfo(
      'reverseGeocode',
      `RESOLVED via placesNearby → ${JSON.stringify(nearby)}`,
    );
    return nearby;
  }

  const googleGeocode = await tryGoogleGeocode(lat, lng);
  if (googleGeocode) {
    logInfo(
      'reverseGeocode',
      `RESOLVED via googleGeocode → ${JSON.stringify(googleGeocode)}`,
    );
    return googleGeocode;
  }

  const nominatim = await tryNominatimReverse(lat, lng);
  if (nominatim) {
    logInfo(
      'reverseGeocode',
      `RESOLVED via nominatimReverse → ${JSON.stringify(nominatim)}`,
    );
    return nominatim;
  }

  logInfo(
    'reverseGeocode',
    'ALL TIERS FAILED — falling back to "Current location"',
  );
  return {
    address: 'Current location',
    shortName: 'Current location',
    lat,
    lng,
  };
};

// Forward search (autocomplete-style) for the location picker's search bar —
// lets the user type "Sector 59" or a landmark name for FROM or TO instead
// of only being able to drag the map pin.
export const searchPlaces = async (
  query: string,
  bias?: { lat: number; lng: number },
): Promise<PlaceSuggestion[]> => {
  const q = query.trim();
  logInfo(
    'searchPlaces',
    `START query="${query}" (trimmed="${q}"), bias=${
      bias ? `${bias.lat},${bias.lng}` : 'none'
    }`,
  );
  if (q.length < 2) {
    logInfo('searchPlaces', 'query too short (<2 chars) — skipping search');
    return [];
  }

  const places = await tryGooglePlacesTextSearch(q, bias);
  if (places.length > 0) {
    logInfo(
      'searchPlaces',
      `RESOLVED via placesTextSearch → ${places.length} result(s)`,
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
