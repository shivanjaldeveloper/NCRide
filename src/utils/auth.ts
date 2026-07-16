import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@ncride_auth_token';
const SESSION_COOKIE_KEY = '@ncride_session_cookie';
const USERNAME_KEY = '@ncride_username';
const NAME_KEY = '@ncride_name';
const EMAIL_KEY = '@ncride_email';
// Permanent marker — set once, the first time this device ever completes a
// login, and deliberately NEVER cleared by clearAuth()/logout. Used only to
// decide whether Splash shows onboarding on a "no cookie" launch: a
// returning user who logged out (or whose session expired) should go
// straight to Login, not back through onboarding — only a genuinely
// first-ever launch should see it.
const HAS_EVER_LOGGED_IN_KEY = '@ncride_has_ever_logged_in';
// Set the moment the user leaves the onboarding carousel (via "Get
// Started" on the last slide OR "Skip") — independent of whether they
// ever actually log in. Ensures onboarding is shown only once per
// install: on every later cold start (even if they never logged in, or
// logged out) Splash skips straight to OTPLogin instead of replaying it.
const HAS_SEEN_ONBOARDING_KEY = '@ncride_has_seen_onboarding';

export const setLoggedIn = async (): Promise<void> => {
  await AsyncStorage.setItem(AUTH_KEY, 'true');
};

export const isLoggedIn = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(AUTH_KEY);
  return val === 'true';
};

// Persist the session returned by VerifyOtp/VerifyCookie. `cookie` is the
// server-issued session token (sent back on subsequent authenticated API
// calls), `username` is the mobile number the account is keyed on, `name`
// is the account holder's display name, and `email` is their email — all
// empty ('') for a brand-new/incomplete profile.
//
// NOTE: uses individual setItem calls (run in parallel) rather than
// AsyncStorage.multiSet — on this build, multiSet/multiRemove aren't
// callable (native module linking gap), while plain getItem/setItem work
// fine. Functionally identical, just sidesteps the broken multi-key API.
export const setSession = async (
  cookie: string,
  username: string,
  name: string,
  email?: string,
): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(SESSION_COOKIE_KEY, cookie),
    AsyncStorage.setItem(USERNAME_KEY, username),
    AsyncStorage.setItem(NAME_KEY, name ?? ''),
    AsyncStorage.setItem(EMAIL_KEY, email ?? ''),
    // Every successful session means this device has, at some point,
    // logged in — permanently record that (see key comment above).
    AsyncStorage.setItem(HAS_EVER_LOGGED_IN_KEY, 'true'),
  ]);
};

export const hasEverLoggedIn = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(HAS_EVER_LOGGED_IN_KEY);
  return val === 'true';
};

// Call once, right when the user leaves onboarding (Skip or Get Started).
export const setHasSeenOnboarding = async (): Promise<void> => {
  await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
  return val === 'true';
};

export const getSessionCookie = async (): Promise<string | null> =>
  AsyncStorage.getItem(SESSION_COOKIE_KEY);

export const getUsername = async (): Promise<string | null> =>
  AsyncStorage.getItem(USERNAME_KEY);

export const getName = async (): Promise<string | null> =>
  AsyncStorage.getItem(NAME_KEY);

export const getEmail = async (): Promise<string | null> =>
  AsyncStorage.getItem(EMAIL_KEY);

// Call after a new user completes the registration screen so the locally
// cached name reflects what was just submitted.
export const setName = async (name: string): Promise<void> => {
  await AsyncStorage.setItem(NAME_KEY, name);
};

// Call after a new user completes the registration screen so the locally
// cached email reflects what was just submitted.
export const setEmail = async (email: string): Promise<void> => {
  await AsyncStorage.setItem(EMAIL_KEY, email);
};

// Call this from LogoutScreen before navigating back to Onboarding/OTPLogin
export const clearAuth = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_KEY),
    AsyncStorage.removeItem(SESSION_COOKIE_KEY),
    AsyncStorage.removeItem(USERNAME_KEY),
    AsyncStorage.removeItem(NAME_KEY),
    AsyncStorage.removeItem(EMAIL_KEY),
  ]);
};
