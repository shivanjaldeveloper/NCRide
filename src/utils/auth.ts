import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@ncride_auth_token';
const SESSION_COOKIE_KEY = '@ncride_session_cookie';
const USERNAME_KEY = '@ncride_username';
const NAME_KEY = '@ncride_name';

export const setLoggedIn = async (): Promise<void> => {
  await AsyncStorage.setItem(AUTH_KEY, 'true');
};

export const isLoggedIn = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(AUTH_KEY);
  return val === 'true';
};

// Persist the session returned by VerifyOtp. `cookie` is the server-issued
// session token (sent back on subsequent authenticated API calls),
// `username` is the mobile number the account is keyed on, and `name` is
// the account holder's display name — empty for a brand-new user.
//
// NOTE: uses individual setItem calls (run in parallel) rather than
// AsyncStorage.multiSet — on this build, multiSet/multiRemove aren't
// callable (native module linking gap), while plain getItem/setItem work
// fine. Functionally identical, just sidesteps the broken multi-key API.
export const setSession = async (
  cookie: string,
  username: string,
  name: string,
): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(SESSION_COOKIE_KEY, cookie),
    AsyncStorage.setItem(USERNAME_KEY, username),
    AsyncStorage.setItem(NAME_KEY, name ?? ''),
  ]);
};

export const getSessionCookie = async (): Promise<string | null> =>
  AsyncStorage.getItem(SESSION_COOKIE_KEY);

export const getUsername = async (): Promise<string | null> =>
  AsyncStorage.getItem(USERNAME_KEY);

export const getName = async (): Promise<string | null> =>
  AsyncStorage.getItem(NAME_KEY);

// Call after a new user completes the registration screen so the locally
// cached name reflects what was just submitted.
export const setName = async (name: string): Promise<void> => {
  await AsyncStorage.setItem(NAME_KEY, name);
};

// Call this from LogoutScreen before navigating back to Onboarding/OTPLogin
export const clearAuth = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_KEY),
    AsyncStorage.removeItem(SESSION_COOKIE_KEY),
    AsyncStorage.removeItem(USERNAME_KEY),
    AsyncStorage.removeItem(NAME_KEY),
  ]);
};
