import type { RideOption } from "../components/ride";

// This build only supports Auto and E-Rickshaw bookings — car/bike/reserve/
// intercity have been dropped. Ported 1:1 from the design reference's
// `window.AUTO_OPTIONS` / `window.ERICKSHAW_OPTIONS`, reshaped onto the
// shared `RideOption` type so both flows can reuse RideScreen + RideCard.
//
// Mapping notes: the reference's options use `desc` (e.g. "2 min away")
// instead of a separate eta/tag pair, and have no struck-through "was"
// fare — RideScreen renders these with `showStrike={false}` on RideCard.

export const AUTO_OPTIONS: RideOption[] = [
  {
    id: "fastest",
    name: "Fastest",
    tag: "2 min away · 3 seats",
    eta: "",
    fare: 110,
    max: 0,
    glyph: "auto",
  },
  {
    id: "lowest",
    name: "Lowest fare",
    tag: "4 min away · 3 seats",
    eta: "",
    fare: 88,
    max: 0,
    glyph: "auto",
  },
  {
    id: "nearby",
    name: "Nearby",
    tag: "1 min away · 3 seats",
    eta: "",
    fare: 96,
    max: 0,
    glyph: "auto",
  },
];

export const ERICKSHAW_OPTIONS: RideOption[] = [
  {
    id: "sector",
    name: "Sector ride",
    tag: "5 min away · Max 3 km",
    eta: "",
    fare: 35,
    max: 0,
    glyph: "erickshaw",
  },
  {
    id: "metro",
    name: "Metro link",
    tag: "3 min away · To metro",
    eta: "",
    fare: 45,
    max: 0,
    glyph: "erickshaw",
  },
  {
    id: "market",
    name: "Market run",
    tag: "4 min away · Local market",
    eta: "",
    fare: 28,
    max: 0,
    glyph: "erickshaw",
  },
];
