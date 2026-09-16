import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, AchievementBadge } from '../types/models';
import { rehydrateItems } from '../utils/timeUtils';

export interface PersistedKitchenState {
  foodItems: FoodItem[];
  rescuedTotalTL: number;
  rescuedCo2Kg: number;
  rescuedMealsCount: number;
  badges?: AchievementBadge[];
  /** v1.1 şema göçleri için versiyon takibi */
  _schemaVersion?: number;
}

const STORAGE_KEY = '@kalanla/kitchen-state-v4';

/**
 * Fix 8: Runtime schema validation.
 * TypeScript cast çalışma anında gerçek tip kontrolü yapmaz.
 * Bozuk veri gelirse uygulama çökmez, null döner.
 */
function isValidState(value: unknown): value is PersistedKitchenState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    Array.isArray(s.foodItems) &&
    typeof s.rescuedTotalTL === 'number' &&
    typeof s.rescuedCo2Kg === 'number' &&
    typeof s.rescuedMealsCount === 'number'
  );
}

export type KitchenLoadResult =
  | { status: 'loaded'; state: PersistedKitchenState }
  | { status: 'empty' }
  | { status: 'error'; error: unknown };

export async function loadKitchenState(): Promise<KitchenLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { status: 'empty' };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.warn('[KALANLA] AsyncStorage JSON parse error:', parseErr);
      return { status: 'error', error: parseErr };
    }

    if (!isValidState(parsed)) {
      console.warn('[KALANLA] AsyncStorage schema invalid');
      return { status: 'error', error: new Error('Invalid schema') };
    }

    // Fix 3 (hibrit): Yüklenen ürünlerin hoursLeft/riskPercentage değerlerini
    // gerçek zamanlı olarak güncelle (timestamp varsa dinamik, yoksa korunur)
    return {
      status: 'loaded',
      state: {
        ...parsed,
        foodItems: rehydrateItems(parsed.foodItems),
      },
    };
  } catch (error) {
    console.warn('[KALANLA] AsyncStorage load error:', error);
    return { status: 'error', error };
  }
}

export async function saveKitchenState(state: PersistedKitchenState): Promise<void> {
  try {
    const payload = { ...state, _schemaVersion: 4 };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[KALANLA] AsyncStorage save error:', error);
  }
}

/**
 * Kullanıcı "Tüm Verileri Sıfırla" dediğinde fiziksel diski tamamen temizler.
 */
export async function clearKitchenState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[KALANLA] AsyncStorage clear error:', error);
  }
}
