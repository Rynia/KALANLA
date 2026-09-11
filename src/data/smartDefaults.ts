import { FoodCategory, StorageLocation } from '../types/models';

export interface SmartDefaultConfig {
  category: FoodCategory;
  location: StorageLocation;
  recommendedDays: number;
  defaultAmount: number;
  unit: string;
}

// Canonical food rules (Clean, non-arbitrary defaults without hardcoded prices)
export const SMART_DEFAULTS_MAP: Record<string, SmartDefaultConfig> = {
  // Süt & Kahvaltılık
  kasar: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 7, defaultAmount: 250, unit: 'g' },
  peynir: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 200, unit: 'g' },
  sut: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 3, defaultAmount: 1, unit: 'Litre' },
  yogurt: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 7, defaultAmount: 500, unit: 'g' },
  yumurta: { category: 'Kiler', location: 'Buzdolabı', recommendedDays: 14, defaultAmount: 6, unit: 'Adet' },
  tereyagi: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 20, defaultAmount: 250, unit: 'g' },
  zeytin: { category: 'Şarküteri', location: 'Buzdolabı', recommendedDays: 30, defaultAmount: 300, unit: 'g' },

  // Sebze & Meyve
  domates: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 4, defaultAmount: 3, unit: 'Adet' },
  biber: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 250, unit: 'g' },
  salatalik: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 4, defaultAmount: 2, unit: 'Adet' },
  patates: { category: 'Sebze', location: 'Kiler', recommendedDays: 14, defaultAmount: 1, unit: 'kg' },
  sogan: { category: 'Sebze', location: 'Kiler', recommendedDays: 14, defaultAmount: 1, unit: 'kg' },
  sarimsak: { category: 'Sebze', location: 'Kiler', recommendedDays: 30, defaultAmount: 1, unit: 'Baş' },
  maydanoz: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 3, defaultAmount: 1, unit: 'Demet' },
  marul: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 3, defaultAmount: 1, unit: 'Adet' },
  limon: { category: 'Meyve', location: 'Buzdolabı', recommendedDays: 14, defaultAmount: 2, unit: 'Adet' },
  elma: { category: 'Meyve', location: 'Buzdolabı', recommendedDays: 10, defaultAmount: 4, unit: 'Adet' },
  muz: { category: 'Meyve', location: 'Kiler', recommendedDays: 4, defaultAmount: 3, unit: 'Adet' },

  // Et & Protein
  tavuk: { category: 'Et & Tavuk', location: 'Buzdolabı', recommendedDays: 2, defaultAmount: 500, unit: 'g' },
  kiyma: { category: 'Et & Tavuk', location: 'Buzdolabı', recommendedDays: 2, defaultAmount: 400, unit: 'g' },
  et: { category: 'Et & Tavuk', location: 'Buzdolabı', recommendedDays: 3, defaultAmount: 500, unit: 'g' },
  sucuk: { category: 'Şarküteri', location: 'Buzdolabı', recommendedDays: 14, defaultAmount: 200, unit: 'g' },

  // Unlu Mamul & Hamur & Kiler
  un: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'kg' },
  misir_unu: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 500, unit: 'g' },
  irmik: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 500, unit: 'g' },
  nisasta: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 200, unit: 'g' },
  yufka: { category: 'Unlu Mamul', location: 'Buzdolabı', recommendedDays: 4, defaultAmount: 3, unit: 'Adet' },
  ekmek: { category: 'Unlu Mamul', location: 'Kiler', recommendedDays: 2, defaultAmount: 1, unit: 'Adet' },
  lavas: { category: 'Unlu Mamul', location: 'Kiler', recommendedDays: 7, defaultAmount: 1, unit: 'Paket' },
  makarna: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  pirinc: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  bulgur: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  mercimek: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  yesil_mercimek: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  nohut: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  kuru_fasulye: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  sehriye: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Paket' },
  tarhana: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 500, unit: 'g' },
  salca: { category: 'Kiler', location: 'Buzdolabı', recommendedDays: 30, defaultAmount: 1, unit: 'Kavanoz' },
  biber_salcasi: { category: 'Kiler', location: 'Buzdolabı', recommendedDays: 30, defaultAmount: 1, unit: 'Kavanoz' },
  kabak: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 2, unit: 'Adet' },
  patlican: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 2, unit: 'Adet' },
  taze_fasulye: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 4, defaultAmount: 500, unit: 'g' },
  ispanak: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 3, defaultAmount: 500, unit: 'g' },
  pirasa: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 7, defaultAmount: 500, unit: 'g' },
  karnabahar: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 6, defaultAmount: 1, unit: 'Adet' },
  brokoli: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 1, unit: 'Adet' },
  dereotu: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 4, defaultAmount: 1, unit: 'Demet' },
  nane: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 4, defaultAmount: 1, unit: 'Demet' },
  taze_sogan: { category: 'Sebze', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 1, unit: 'Demet' },
  lor: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 5, defaultAmount: 250, unit: 'g' },
  beyaz_peynir: { category: 'Süt Ürünü', location: 'Buzdolabı', recommendedDays: 7, defaultAmount: 300, unit: 'g' },
  sivi_yag: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Litre' },
  zeytinyagi: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 1, unit: 'Litre' },
  ceviz: { category: 'Kiler', location: 'Kiler', recommendedDays: 90, defaultAmount: 200, unit: 'g' },
  susam: { category: 'Kiler', location: 'Kiler', recommendedDays: 180, defaultAmount: 100, unit: 'g' },
};

/**
 * Robust Turkish normalizer for food search keys
 */
export const normalizeFoodKey = (input: string): string => {
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

/**
 * Resolves smart defaults without naive substring bugs (prioritizes exact and longest token matches)
 */
export const resolveSmartDefaults = (rawInput: string): SmartDefaultConfig | null => {
  const normalized = normalizeFoodKey(rawInput);
  if (!normalized) return null;

  // 1. Exact match
  if (SMART_DEFAULTS_MAP[normalized]) {
    return SMART_DEFAULTS_MAP[normalized];
  }

  // 2. Word by word match
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (SMART_DEFAULTS_MAP[word]) {
      return SMART_DEFAULTS_MAP[word];
    }
  }

  // 3. Longest substring candidate (to prevent 'et' from matching 'market' or 'sucuk' matching 'sucuklu yumurta' incorrectly)
  const candidateKeys = Object.keys(SMART_DEFAULTS_MAP)
    .filter((k) => normalized.includes(k) && k.length > 2)
    .sort((a, b) => b.length - a.length);

  if (candidateKeys.length > 0) {
    return SMART_DEFAULTS_MAP[candidateKeys[0]];
  }

  return null;
};
