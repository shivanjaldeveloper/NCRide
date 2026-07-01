import { Platform, Linking } from 'react-native';
import {
  check,
  checkMultiple,
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';

export type LocationStatus = {
  permissionGranted: boolean;
  servicesEnabled: boolean;
  permBlocked: boolean; // BLOCKED or RESTRICTED — must open Settings
  allGood: boolean;
};

// Android 12+ lets the user grant "Approximate" (COARSE) location without
// granting "Precise" (FINE). That is still a valid grant from the user's
// point of view — Settings shows location as ON — so we must treat EITHER
// permission being GRANTED as "permission granted". Checking FINE only
// (the old behaviour) caused the location guard to loop forever for anyone
// who picked Approximate.
const ANDROID_PERMS = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
];
const IOS_PERM = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

const reduceAndroidResults = (results: Record<string, string>) => {
  const fine = results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
  const coarse = results[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
  const granted = fine === RESULTS.GRANTED || coarse === RESULTS.GRANTED;
  // Only truly "blocked" (must go to Settings) when BOTH are blocked —
  // if either can still be prompted, the native dialog can still be shown.
  const isBlockedResult = (r?: string) =>
    r === RESULTS.BLOCKED || r === RESULTS.RESTRICTED;
  const blocked = !granted && isBlockedResult(fine) && isBlockedResult(coarse);
  return { granted, blocked };
};

// Read-only — never shows OS dialog
export const checkLocationPermission = async (): Promise<{
  granted: boolean;
  blocked: boolean;
}> => {
  try {
    if (Platform.OS === 'android') {
      const results = await checkMultiple(ANDROID_PERMS);
      return reduceAndroidResults(results as Record<string, string>);
    }
    const result = await check(IOS_PERM);
    return {
      granted: result === RESULTS.GRANTED,
      blocked: result === RESULTS.BLOCKED || result === RESULTS.RESTRICTED,
    };
  } catch {
    return { granted: false, blocked: false };
  }
};

// Shows OS permission dialog if not yet decided
export const requestLocationPermission = async (): Promise<{
  granted: boolean;
  blocked: boolean;
}> => {
  try {
    if (Platform.OS === 'android') {
      const results = await requestMultiple(ANDROID_PERMS);
      return reduceAndroidResults(results as Record<string, string>);
    }
    const result = await request(IOS_PERM);
    return {
      granted: result === RESULTS.GRANTED,
      blocked: result === RESULTS.BLOCKED || result === RESULTS.RESTRICTED,
    };
  } catch {
    return { granted: false, blocked: false };
  }
};

// Android: checks whether GPS/network location toggle is ON
// iOS: if permission is GRANTED, services are always on from our perspective
export const checkLocationServices = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') return true;
  try {
    return await isLocationEnabled();
  } catch {
    return false;
  }
};

// Android: shows the lightweight Play-Services "Turn on Location" resolution
// dialog (stays inside the app). Useful for flows like the permission screen
// where we don't want to send the user away from the app.
export const promptEnableLocationServices = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') return true;
  try {
    const result = await promptForEnableLocationIfNeeded();
    return result === 'enabled' || result === 'already-enabled';
  } catch {
    return false;
  }
};

// Opens the device's SYSTEM Location Settings screen (Settings ▸ Location) —
// this is a system-wide toggle, not an app permission, so it must NOT open
// the app's own settings page.
export const openLocationSourceSettings = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      return;
    } catch {
      // Some OEMs/older Android versions can reject the intent — fall back
      // to the app settings page rather than doing nothing.
    }
  }
  // iOS has no public deep link into the system Location Services page;
  // the app's own settings screen is the closest reachable equivalent.
  openSettings();
};

// Opens the APP's own settings page — only relevant once permission is
// permanently blocked ("Don't ask again" / iOS denied), since that's the
// only place left that can grant it back.
export const goToLocationSettings = () => openSettings();

// Full composite check — use this everywhere we need to decide routing
export const checkFullLocationStatus = async (): Promise<LocationStatus> => {
  const { granted, blocked } = await checkLocationPermission();
  let servicesEnabled = false;
  if (granted) {
    servicesEnabled = await checkLocationServices();
  }
  return {
    permissionGranted: granted,
    servicesEnabled,
    permBlocked: blocked,
    allGood: granted && servicesEnabled,
  };
};
