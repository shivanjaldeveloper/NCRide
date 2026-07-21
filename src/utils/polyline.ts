// Decodes a Google-style encoded polyline string (the same format returned
// by Directions/Routes API, and now by the ride-estimate backend's
// `Route.EncodedPolyline`) into an array of lat/lng points react-native-maps'
// <Polyline> can render directly. Standard algorithm — no extra native
// package needed for this.
export type PolylinePoint = { latitude: number; longitude: number };

export const decodePolyline = (encoded: string): PolylinePoint[] => {
  if (!encoded) return [];
  const points: PolylinePoint[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
};
