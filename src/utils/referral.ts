import AsyncStorage from '@react-native-async-storage/async-storage';

// Local persistence for a referral code the user has *entered* to unlock a
// discount (distinct from the ReferralsScreen's OWN outbound code the user
// shares with others). One-time use per device — once applied, the Account
// screen shows it as redeemed instead of re-prompting.
const APPLIED_CODE_KEY = '@ncride_applied_referral_code';
const APPLIED_DISCOUNT_KEY = '@ncride_applied_referral_discount';

export interface AppliedReferral {
  code: string;
  discountLabel: string;
}

// TODO: no confirmed backend endpoint for referral-code redemption yet
// (nothing under auth.asmx covers it). Validation below is local/mock —
// swap validateReferralCode() for a real API call (e.g. an
// `ApplyReferralCode` call on the customer endpoint) once a curl/response
// pair is confirmed, without needing to touch the storage helpers or the
// modal UI.

export const getAppliedReferral = async (): Promise<AppliedReferral | null> => {
  const [code, discountLabel] = await Promise.all([
    AsyncStorage.getItem(APPLIED_CODE_KEY),
    AsyncStorage.getItem(APPLIED_DISCOUNT_KEY),
  ]);
  if (!code || !discountLabel) return null;
  return { code, discountLabel };
};

export const setAppliedReferral = async (
  code: string,
  discountLabel: string,
): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(APPLIED_CODE_KEY, code),
    AsyncStorage.setItem(APPLIED_DISCOUNT_KEY, discountLabel),
  ]);
};

export const clearAppliedReferral = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem(APPLIED_CODE_KEY),
    AsyncStorage.removeItem(APPLIED_DISCOUNT_KEY),
  ]);
};

export type ReferralValidationResult =
  | { ok: true; discountLabel: string }
  | { ok: false; reason: 'invalid' | 'self' | 'already_applied' };

// Local/mock validation — accepts any well-formed code (4-12 alphanumeric
// chars, optionally with a single hyphen, e.g. "ARYA-N62") that isn't the
// user's own outbound code. Real validation (does this code exist, has it
// already been used, etc.) belongs on the server — this only guards the UI
// until that endpoint exists.
const CODE_FORMAT = /^[A-Z0-9]{3,10}(?:-[A-Z0-9]{2,6})?$/;

export const validateReferralCodeFormat = (raw: string): boolean =>
  CODE_FORMAT.test(raw.trim().toUpperCase());
