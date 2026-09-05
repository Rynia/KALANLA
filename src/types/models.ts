export type TabType = 'gor' | 'pisir' | 'kazancin';

export type FoodCategory =
  | 'Süt Ürünü'
  | 'Unlu Mamul'
  | 'Sebze'
  | 'Şarküteri'
  | 'Et & Tavuk'
  | 'Meyve'
  | 'Kiler';

export type StorageLocation = 'Buzdolabı' | 'Dondurucu' | 'Kiler';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  amount: string;
  /** Sayısal miktar (kısmi tüketim için) */
  quantity?: number;
  /** Birim: 'g' | 'kg' | 'Adet' | 'Demet' | 'ml' | 'L' */
  unit?: string;
  location: StorageLocation;
  /** Kalan saat — eski veri için fallback, dinamik hesap için bkz. getEffectiveHoursLeft() */
  hoursLeft: number;
  riskPercentage: number;
  priceTL: number;
  imageUrl: string;
  addedAt: string;
  /** Unix timestamp (ms) — yeni eklenen ürünler için zorunlu */
  addedTimestamp?: number;
  /** Tahmini raf ömrü saat cinsinden — addedTimestamp ile birlikte kullanılır */
  estimatedShelfLifeHours?: number;
}

export interface RequiredItem {
  name: string;
  rescued: boolean;
  isPantry?: boolean;
  /** Tarifin tükettiği miktar, örn. '200g' veya '2' (kısmi tüketim için) */
  consumeAmount?: string;
}

export interface RescueRecipe {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  savedTL: number;
  matchPercentage: number;
  /** Dinamik urgency skoru — recipeEngine tarafından hesaplanır */
  urgencyScore?: number;
  calories: number;
  protein: string;
  imageUrl: string;
  matchedItemNames: string[];
  /** Eksik malzeme isimleri — recipeEngine tarafından hesaplanır */
  missingItemNames?: string[];
  requiredItemNames: RequiredItem[];
  instructions: string[];
  co2SavedKg: number;
  isChefPick?: boolean;
}

export interface ThermalReceiptData {
  id: string;
  date: string;
  time: string;
  txCode: string;
  recipeTitle: string;
  items: {
    name: string;
    amount: string;
    priceTL: number;
  }[];
  totalSavedTL: number;
  co2SavedKg: number;
  durationMinutes: number;
  barcodeNumber: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  rank: 'ALTIN' | 'PLATİN' | 'GÜMÜŞ' | 'BRONZ';
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: string;
}

export interface CatalogIngredient {
  name: string;
  category: FoodCategory;
  defaultDays: number;
  defaultValue: number;
  unit: string;
  location: StorageLocation;
  imageUrl?: string;
}
