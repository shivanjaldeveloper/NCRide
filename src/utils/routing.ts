export type RouteCoordinate = { latitude: number; longitude: number };

export type RouteResult = {
  coordinates: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds: number;
};

// OSRM's public demo server — free, no API key, same OSM ecosystem as the
// Nominatim geocoder already used in this app. Good enough for drawing a
// realistic road-following route line for the pickup → drop preview.
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export const getRoute = async (
  pickup: { lat: number; lng: number },
  drop: { lat: number; lng: number },
): Promise<RouteResult | null> => {
  try {
    const url =
      `${OSRM_BASE}/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const route = json?.routes?.[0];
    const geoCoords = route?.geometry?.coordinates;
    if (!Array.isArray(geoCoords) || geoCoords.length === 0) return null;

    const coordinates: RouteCoordinate[] = geoCoords.map(
      ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng }),
    );
    return {
      coordinates,
      distanceMeters: route.distance ?? 0,
      durationSeconds: route.duration ?? 0,
    };
  } catch {
    return null;
  }
};
