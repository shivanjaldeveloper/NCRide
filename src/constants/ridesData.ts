import type { RideOption } from '../components/ride';

// Ported 1:1 from the design reference's `window.RIDE_TYPES` so the ride
// selection screen draws from the same source of truth as the mock.
export const RIDE_TYPES: RideOption[] = [
  { id: 'mini', name: 'NCRide Mini', tag: 'Most affordable', eta: '3 min', fare: 149, max: 4, glyph: 'sedan' },
  { id: 'sedan', name: 'NCRide Sedan', tag: 'Comfortable', eta: '4 min', fare: 228, max: 4, glyph: 'sedan' },
  { id: 'prime', name: 'NCRide Prime', tag: 'Top-rated drivers', eta: '6 min', fare: 284, max: 4, glyph: 'sedan' },
  { id: 'xl', name: 'NCRide XL', tag: 'Groups & luggage', eta: '8 min', fare: 364, max: 6, glyph: 'suv' },
  { id: 'bike', name: 'Bike Taxi', tag: 'Fastest in traffic', eta: '1 min', fare: 72, max: 1, glyph: 'bike' },
  { id: 'auto', name: 'Auto Rickshaw', tag: 'Quick & nimble', eta: '2 min', fare: 96, max: 3, glyph: 'auto' },
];
