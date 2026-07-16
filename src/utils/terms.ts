import AsyncStorage from '@react-native-async-storage/async-storage';
import { TERMS_VERSION, TERMS_SYNC_ENABLED } from '../constants/legal';
import { isAuthApiError } from '../services/authApi';

const TERMS_VERSION_KEY = '@ncride_terms_version';
const TERMS_ACCEPTED_AT_KEY = '@ncride_terms_accepted_at';

// Persist that the CURRENT TERMS_VERSION was accepted, with a timestamp —
// this is the local half of the audit trail (who/what/when). Safe to call
// repeatedly (e.g. every time the checkbox is toggled on) — always
// overwrites with the current version + a fresh timestamp.
export const setTermsAccepted = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(TERMS_VERSION_KEY, TERMS_VERSION),
    AsyncStorage.setItem(TERMS_ACCEPTED_AT_KEY, new Date().toISOString()),
  ]);
};

export const getAcceptedTermsVersion = async (): Promise<string | null> =>
  AsyncStorage.getItem(TERMS_VERSION_KEY);

export const getTermsAcceptedAt = async (): Promise<string | null> =>
  AsyncStorage.getItem(TERMS_ACCEPTED_AT_KEY);

// Whether the CURRENT TERMS_VERSION (constants/legal.ts) has been accepted
// on this device. Returns false for a brand-new device (nothing stored
// yet) AND for a device that accepted an older version — both cases route
// through the same "please accept" gate, just at different points in the
// flow (OTPLogin for the former, TermsUpdateScreen for the latter, since
// the latter may already be logged in).
export const hasAcceptedCurrentTerms = async (): Promise<boolean> => {
  const stored = await getAcceptedTermsVersion();
  return stored === TERMS_VERSION;
};

/**
 * Record acceptance both locally (always) and on the backend (once a real
 * endpoint exists — see TERMS_SYNC_ENABLED in constants/legal.ts). `cookie`
 * is optional since this is called from OTPLoginScreen BEFORE a session
 * cookie exists yet — in that case only the local record is written, and
 * the remote sync should be re-attempted the next time this is called with
 * a cookie (e.g. right after login completes), which harmlessly re-sends
 * the same version.
 *
 * Deliberately swallows remote sync failures — a terms-sync hiccup must
 * never block login/signup, since the local record is already the
 * authoritative gate for the UI.
 */
export const acceptTerms = async (cookie?: string): Promise<void> => {
  await setTermsAccepted();

  if (!TERMS_SYNC_ENABLED || !cookie) return;

  try {
    // TODO: once aloapp.shop exposes a real "AcceptTerms" endpoint, add
    // `acceptTermsRemote(cookie, version)` to services/authApi.ts (same
    // plain form-urlencoded + bearer pattern as the other auth.asmx
    // calls) and call it here. Left as a no-op-safe stub until then so
    // flipping TERMS_SYNC_ENABLED to true doesn't reference a function
    // that doesn't exist yet.
  } catch (err) {
    if (__DEV__) {
      console.warn(
        '[terms] remote sync failed — local acceptance still recorded',
        isAuthApiError(err) ? err.message : err,
      );
    }
  }
};
