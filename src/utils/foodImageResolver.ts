// src/utils/foodImageResolver.ts
// Türkçe karakter duyarlı, genişletilebilir görsel eşleştirme motoru
import { FoodCategory } from '../types/models';

/** Türkçe karakter normalize + lowercase helper */
function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/** Anahtar kelime → Unsplash URL haritası */
const FOOD_IMAGE_MAP: Record<string, string> = {
  // Süt Ürünleri
  kasar:       'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
  peynir:      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
  yogurt:      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
  suzme:       'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
  sut:         'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80',
  kefir:       'https://images.unsplash.com/photo-1606168094336-48f8b0b0b0d7?w=400&auto=format&fit=crop&q=80',
  tereyagi:    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80',
  krema:       'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80',
  // Sebzeler
  domates:     'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  salatalik:   'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop&q=80',
  biber:       'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop&q=80',
  charliston:  'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop&q=80',
  patlican:    'https://images.unsplash.com/photo-1659469891728-41e96aa1c27c?w=400&auto=format&fit=crop&q=80',
  patates:     'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400&auto=format&fit=crop&q=80',
  havuc:       'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80',
  mantar:      'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&auto=format&fit=crop&q=80',
  ispanak:     'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80',
  sogan:       'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80',
  sarimsak:    'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop&q=80',
  brokoli:     'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80',
  karnabahar:  'https://images.unsplash.com/photo-1603046891726-36bfd957e0bf?w=400&auto=format&fit=crop&q=80',
  maydanoz:    'https://images.unsplash.com/photo-1608797178974-15b35a61dd75?w=400&auto=format&fit=crop&q=80',
  dereotu:     'https://images.unsplash.com/photo-1591927328873-2b1f88f07a20?w=400&auto=format&fit=crop&q=80',
  fesligen:    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80',
  nane:        'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&auto=format&fit=crop&q=80',
  kabak:       'https://images.unsplash.com/photo-1596591868231-b1cb8b3e82e6?w=400&auto=format&fit=crop&q=80',
  misir:       'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=80',
  pirasa:      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
  kereviz:     'https://images.unsplash.com/photo-1566157924-0b7e2a5e31ec?w=400&auto=format&fit=crop&q=80',
  turp:        'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&auto=format&fit=crop&q=80',
  pancar:      'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&auto=format&fit=crop&q=80',
  // Et & Tavuk
  kiyma:       'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80',
  dana:        'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80',
  tavuk:       'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
  pilic:       'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
  et:          'https://images.unsplash.com/photo-1588347818036-c2e6b5f01f48?w=400&auto=format&fit=crop&q=80',
  kuzu:        'https://images.unsplash.com/photo-1588347818036-c2e6b5f01f48?w=400&auto=format&fit=crop&q=80',
  balik:       'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop&q=80',
  somon:       'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80',
  // Şarküteri
  zeytin:      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&auto=format&fit=crop&q=80',
  sucuk:       'https://images.unsplash.com/photo-1571167366136-b57cde21e87d?w=400&auto=format&fit=crop&q=80',
  salam:       'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80',
  sosis:       'https://images.unsplash.com/photo-1558030137-a56c1b002c8b?w=400&auto=format&fit=crop&q=80',
  // Unlu Mamul
  ekmek:       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  bayat:       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  pide:        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  makarna:     'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&auto=format&fit=crop&q=80',
  pirinc:      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&auto=format&fit=crop&q=80',
  bulgur:      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80',
  // Meyveler
  elma:        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
  muz:         'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
  portakal:    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&auto=format&fit=crop&q=80',
  limon:       'https://images.unsplash.com/photo-1601987077677-5346c463575b?w=400&auto=format&fit=crop&q=80',
  uzum:        'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop&q=80',
  cilek:       'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80',
  karpuz:      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80',
  seftali:     'https://images.unsplash.com/photo-1595546070645-73e6a5db9e5a?w=400&auto=format&fit=crop&q=80',
  armut:       'https://images.unsplash.com/photo-1561136594-7f68813d8019?w=400&auto=format&fit=crop&q=80',
  // Kiler
  yumurta:     'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80',
  nohut:       'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&auto=format&fit=crop&q=80',
  mercimek:    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&auto=format&fit=crop&q=80',
  fasulye:     'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&auto=format&fit=crop&q=80',
  salca:       'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  zeytinyagi:  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
};

/** Kategori fallback görselleri */
const CATEGORY_FALLBACK: Record<FoodCategory, string> = {
  'Süt Ürünü':  'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80',
  'Unlu Mamul': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  'Sebze':      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80',
  'Şarküteri':  'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&auto=format&fit=crop&q=80',
  'Et & Tavuk': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
  'Meyve':      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
  'Kiler':      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&auto=format&fit=crop&q=80';

/**
 * Ürün adına göre en uygun Unsplash görselini döndürür.
 * Önce exact/partial keyword match, ardından kategori fallback, en sonda genel default.
 */
export function resolveFoodImage(name: string, category?: FoodCategory): string {
  const normalizedName = normalize(name);

  // 1. Tam eşleşme
  if (FOOD_IMAGE_MAP[normalizedName]) {
    return FOOD_IMAGE_MAP[normalizedName];
  }

  // 2. Token-based tam kelime eşleşmesi (min 3 karakter)
  const nameTokens = normalizedName.split(/\s+/);
  for (const token of nameTokens) {
    if (token.length >= 3 && FOOD_IMAGE_MAP[token]) {
      return FOOD_IMAGE_MAP[token];
    }
  }

  // 3. Kısmi eşleşme — sadece isim anahtar kelimeyi içeriyor mu? (tek yönlü, min 3 harf)
  for (const [keyword, url] of Object.entries(FOOD_IMAGE_MAP)) {
    if (keyword.length >= 3 && normalizedName.includes(keyword)) {
      return url;
    }
  }

  // 3. Kategori fallback
  if (category && CATEGORY_FALLBACK[category]) {
    return CATEGORY_FALLBACK[category];
  }

  // 4. Genel fallback
  return DEFAULT_IMAGE;
}
