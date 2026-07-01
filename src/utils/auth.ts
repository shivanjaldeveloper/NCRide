import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@ncride_auth_token';

export const setLoggedIn = async (): Promise<void> => {
  await AsyncStorage.setItem(AUTH_KEY, 'true');
};

export const isLoggedIn = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(AUTH_KEY);
  return val === 'true';
};

// Call this from LogoutScreen before navigating back to Onboarding/OTPLogin
export const clearAuth = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_KEY);
};
