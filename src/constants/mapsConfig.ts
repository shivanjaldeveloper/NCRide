// Central place for the Google Maps Platform key(s) so they're never
// duplicated across files.
//
// TWO SEPARATE KEYS ARE REQUIRED — they cannot be the same key:
//   • The AndroidManifest.xml key (com.google.android.geo.API_KEY) —
//     restricted to "Android apps" (package name + SHA-1). Used ONLY by the
//     native Maps SDK, which attaches the app's package identity itself.
//   • GOOGLE_MAPS_API_KEY below — restricted to "None" (Application
//     restrictions) + "Places API (New)" only (API restrictions). Used for
//     plain JS `fetch()` calls from this file, which carry no Android app
//     identity at all — an Android-app-restricted key rejects these with
//     API_KEY_ANDROID_APP_BLOCKED, which is why the first key never worked
//     here.
//
// This key must have "Places API (New)" enabled in Google Cloud Console →
// APIs & Services (a different product from the legacy "Places API" /
// "Geocoding API" — those use maps.googleapis.com/maps/api/... with a
// `?key=` query param; Places API (New) uses places.googleapis.com/v1/...
// with an `X-Goog-Api-Key` header — do not mix the two).
export const GOOGLE_MAPS_API_KEY = 'AIzaSyAU4PPy7jML1IcDSHgwWjoZHm-AaIDt1JI';

// Places API (New) base URL
export const PLACES_API_BASE = 'https://places.googleapis.com/v1';

// Bias/restrict search results to India by default (app targets NCR/Delhi
// and Marathwada, Maharashtra) — tweak/remove if the app ever goes
// multi-country.
export const PLACES_REGION_CODE = 'in';
export const PLACES_LANGUAGE = 'en';
