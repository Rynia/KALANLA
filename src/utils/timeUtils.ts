// src/utils/timeUtils.ts
// Gerçek zamanlı hoursLeft ve riskPercentage hesaplama
import { FoodItem } from '../types/models';

/**
 * FoodItem için güncel kalan saati hesaplar.
 * - Yeni format: addedTimestamp + estimatedShelfLifeHours → dinamik
 * - Eski format: doğrudan hoursLeft değerini kullan (hibrit geçiş)
 */
export function getEffectiveHoursLeft(item: FoodItem): number {
  if (item.addedTimestamp != null && item.estimatedShelfLifeHours != null) {
    const elapsedHours = (Date.now() - item.addedTimestamp) / 3_600_000;
    return Math.max(0, item.estimatedShelfLifeHours - elapsedHours);
  }
  return Math.max(0, item.hoursLeft);
}

/**
 * Kalan saate göre risk yüzdesi (0–100).
 */
export function getEffectiveRiskPercentage(item: FoodItem): number {
  const hours = getEffectiveHoursLeft(item);
  if (hours <= 12) return 98;
  if (hours <= 24) return 92;
  if (hours <= 48) return 80;
  if (hours <= 72) return 65;
  if (hours <= 120) return 45;
  if (hours <= 168) return 30;
  return Math.max(5, Math.round(100 - (hours / ((item.estimatedShelfLifeHours ?? item.hoursLeft) || 1)) * 100));
}

/**
 * Envanterdeki tüm ürünler için hoursLeft ve riskPercentage'ı yeniden hesaplar.
 * AsyncStorage yüklendiğinde veya render öncesinde kullanılır.
 */
export function rehydrateItems(items: FoodItem[]): FoodItem[] {
  return items.map((item) => ({
    ...item,
    hoursLeft: Math.round(getEffectiveHoursLeft(item)),
    riskPercentage: getEffectiveRiskPercentage(item),
  }));
}
