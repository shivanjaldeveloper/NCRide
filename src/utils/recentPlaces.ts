// Stores the last few locations the user actually confirmed in the
// LocationPickerScreen (from search, GPS, or manual pin-drop) so they can be
// shown instantly — no network call — the next time the picker opens with
// an empty search box. Separate from `useSavedPlaces` (Profile's
// user-named Home/Work favorites); this is an automatic, unnamed MRU list.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentPlace = {
  id: string;
  shortName: string;
  address: string;
  lat: number;
  lng: number;
  savedAt: number; // epoch ms
};

const STORAGE_KEY = '@ncride_recent_places';
const MAX_RECENTS = 8;

let cache: RecentPlace[] | null = null;

const load = async (): Promise<RecentPlace[]> => {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : [];
  } catch (e) {
    if (__DEV__) console.warn('[recentPlaces] load failed', e);
    cache = [];
  }
  return cache ?? [];
};

const persist = async (list: RecentPlace[]) => {
  cache = list;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    if (__DEV__) console.warn('[recentPlaces] persist failed', e);
  }
};

export const getRecentPlaces = async (): Promise<RecentPlace[]> => {
  return load();
};

// Adds/promotes a place to the front of the MRU list. De-dupes by address
// (a fresh pin-drop 2m from an old one shouldn't spam the list with
// near-duplicates) and caps the list at MAX_RECENTS.
export const addRecentPlace = async (
  place: Omit<RecentPlace, 'savedAt' | 'id'> & { id?: string },
): Promise<void> => {
  const list = await load();
  const withoutDupe = list.filter(
    p => p.address !== place.address || p.shortName !== place.shortName,
  );
  const next: RecentPlace[] = [
    {
      id: place.id ?? `recent-${Date.now()}`,
      shortName: place.shortName,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      savedAt: Date.now(),
    },
    ...withoutDupe,
  ].slice(0, MAX_RECENTS);
  await persist(next);
};

export const clearRecentPlaces = async (): Promise<void> => {
  await persist([]);
};
