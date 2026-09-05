import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, AchievementBadge } from '../types/models';
import { rehydrateItems } from '../utils/timeUtils';

export interface PersistedKitchenState {
  foodItems: FoodItem[];
  rescuedTotalTL: number;
  rescuedCo2Kg: number;
  rescuedMealsCount: number;
  badges?: AchievementBadge[];
}

const STORAGE_KEY = '@kalanla/kitchen-state-v3';

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

export async function loadKitchenState(): Promise<PersistedKitchenState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn('[KALANLA] AsyncStorage JSON parse error — resetting');
      return null;
    }

    if (!isValidState(parsed)) {
      console.warn('[KALANLA] AsyncStorage schema invalid — resetting');
      return null;
    }

    // Fix 3 (hibrit): Yüklenen ürünlerin hoursLeft/riskPercentage değerlerini
    // gerçek zamanlı olarak güncelle (timestamp varsa dinamik, yoksa korunur)
    return {
      ...parsed,
      foodItems: rehydrateItems(parsed.foodItems),
    };
  } catch (error) {
    console.warn('[KALANLA] AsyncStorage load error:', error);
    return null;
  }
}

export async function saveKitchenState(state: PersistedKitchenState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[KALANLA] AsyncStorage save error:', error);
  }
}
