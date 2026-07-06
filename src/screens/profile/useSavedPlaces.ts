import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { IconName } from '../../components/common/iconPaths';

export interface SavedPlace {
  id: string;
  icon: IconName;
  title: string;
  sub: string; // full formatted address
  accent?: string;
  lat: number;
  lng: number;
  accuracy?: number; // GPS accuracy in metres at time of save, if known
}

const STORAGE_KEY = '@ncride_saved_places';

export function useSavedPlaces() {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          console.log('[useSavedPlaces] loaded from storage');
          setPlaces(JSON.parse(raw));
        } else {
          console.log('[useSavedPlaces] no saved places yet');
          setPlaces([]);
        }
      } catch (e) {
        console.log('[useSavedPlaces] load failed', e);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addPlace = useCallback((place: SavedPlace) => {
    setPlaces(prev => {
      const next = [...prev, place];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(e =>
        console.log('[useSavedPlaces] addPlace persist failed', e),
      );
      return next;
    });
  }, []);

  const updatePlace = useCallback((id: string, patch: Partial<SavedPlace>) => {
    setPlaces(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, ...patch } : p));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(e =>
        console.log('[useSavedPlaces] updatePlace persist failed', e),
      );
      return next;
    });
  }, []);

  const removePlace = useCallback((id: string) => {
    setPlaces(prev => {
      const next = prev.filter(p => p.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(e =>
        console.log('[useSavedPlaces] removePlace persist failed', e),
      );
      return next;
    });
  }, []);

  return { places, loading, addPlace, updatePlace, removePlace };
}
