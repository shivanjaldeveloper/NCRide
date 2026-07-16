// Single source of truth for the legal docs shown at signup/login.
//
// IMPORTANT: TERMS_URL / PRIVACY_URL must point at hosted pages (your own
// domain), not be inlined as strings in the app — that way legal can
// update the wording without needing an app store release.
//
// TODO: replace these with the real hosted URLs once they exist.
export const TERMS_URL = 'https://aloapp.shop/legal/terms';
export const PRIVACY_URL = 'https://aloapp.shop/legal/privacy';

// Bump this any time the Terms/Privacy content materially changes. Every
// account's accepted version is compared against this on each app launch
// (see utils/terms.ts + SplashScreen) — a mismatch routes even an
// already-logged-in user through TermsUpdateScreen for re-consent before
// Home. Use a simple incrementing string ("1.0" -> "1.1" -> "2.0"), not a
// date, so the comparison is unambiguous.
export const TERMS_VERSION = '1.0';

// Single switch for "is the backend ready to record terms acceptance yet".
// Stays false until a real AcceptTerms-style endpoint exists on
// aloapp.shop — while false, acceptance is recorded LOCALLY ONLY (still
// fully functional for gating the UI), and syncTermsAcceptance() in
// utils/terms.ts is a no-op. Flip this to true in the SAME commit as
// wiring the real endpoint in services/authApi.ts.
export const TERMS_SYNC_ENABLED = false;
