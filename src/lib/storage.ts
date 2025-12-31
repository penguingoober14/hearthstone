import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Custom JSON reviver that restores Date objects from ISO strings
 */
function dateReviver(_key: string, value: unknown): unknown {
  // Handle our custom Date format
  if (value && typeof value === 'object' && (value as any).__type === 'Date' && (value as any).value) {
    return new Date((value as any).value);
  }
  // Also handle plain ISO date strings (backwards compatibility)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

/**
 * Custom JSON replacer that serializes Date objects
 */
function dateReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() };
  }
  return value;
}

/**
 * Date-aware AsyncStorage adapter
 * Properly serializes and deserializes Date objects
 */
const dateAwareAsyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(name);
    if (value) {
      try {
        // Parse with Date revival, then re-stringify for Zustand
        const parsed = JSON.parse(value, dateReviver);
        return JSON.stringify(parsed);
      } catch {
        return value;
      }
    }
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Parse Zustand's value and re-serialize with Date handling
      const parsed = JSON.parse(value);
      const serialized = JSON.stringify(parsed, dateReplacer);
      await AsyncStorage.setItem(name, serialized);
    } catch {
      await AsyncStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

/**
 * Create Zustand storage config with Date support
 * Use this instead of createJSONStorage(() => AsyncStorage)
 */
export function createDateAwareStorage() {
  return createJSONStorage(() => dateAwareAsyncStorage);
}
