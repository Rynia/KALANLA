import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, AchievementBadge } from '../types/models';

export interface PersistedKitchenState {
  foodItems: FoodItem[];
  rescuedTotalTL: number;
  rescuedCo2Kg: number;
  rescuedMealsCount: number;
  badges?: AchievementBadge[];
}

const STORAGE_KEY = '@kalanla/kitchen-state-v2';

export async function loadKitchenState(): Promise<PersistedKitchenState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedKitchenState;
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
