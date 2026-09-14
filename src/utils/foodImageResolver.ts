// src/utils/foodImageResolver.ts
// KALANLA Yerel + Uzak Görsel Çözümleyici Motoru
// Öncelik: Kullanıcının indirdiği doğrulanmış yerel görseller (assets/food/ingredients ve assets/food/recipes)
import { ImageSourcePropType } from 'react-native';
import { FoodCategory } from '../types/models';
import { INGREDIENT_ASSETS, RECIPE_ASSETS } from '../data/foodAssets';

/** Türkçe karakter normalize + lowercase helper */
export function normalizeTurkish(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/**
 * Malzeme adı veya ID'sini yerel `assets/food/ingredients` dosyalarına eşler
 */
const INGREDIENT_KEY_MAP: Record<string, string> = {
  // Süt & Şarküteri
  'suzme': 'suzme-yogurt',
  'suzme yogurt': 'suzme-yogurt',
  'krema': 'krema',
  'kefir': 'kefir',
  'ayran': 'kefir',
  'siyah zeytin': 'siyah-zeytin',
  'yesil zeytin': 'yesil-zeytin',
  'zeytin': 'siyah-zeytin',
  'sucuk': 'sucuk',
  'salam': 'salam',
  'sosis': 'sosis',

  // Sebzeler & Yeşillikler
  'sivri biber': 'sivri-biber',
  'biber': 'sivri-biber',
  'charliston': 'charliston',
  'carliston': 'charliston',
  'patlican': 'patlican',
  'mantar': 'mantar',
  'maydanoz': 'maydanoz',
  'dereotu': 'dereotu',
  'fesligen': 'fesligen',
  'feslegen': 'fesligen',
  'nane': 'nane',
  'kabak': 'kabak',
  'pirasa': 'pirasa',
  'kereviz': 'kereviz',
  'turp': 'turp',
  'semizotu': 'semizotu',
  'roka': 'roka',
  'tere': 'tere',
  'borulce': 'borulce',

  // Et, Tavuk & Balık
  'kiyma': 'kiyma',
  'dana eti': 'dana-eti',
  'dana': 'dana-eti',
  'kirmizi et': 'kirmizi-et',
  'et': 'kirmizi-et',
  'kuzu eti': 'kuzu-eti',
  'kuzu': 'kuzu-eti',
  'balik': 'balik',
  'hamsi': 'hamsi',
  'somon': 'somon',

  // Unlu Mamul & Bakliyat & Kiler
  'ekmek': 'ekmek',
  'pide': 'pide',
  'bulgur': 'bulgur',
  'yufka': 'yufka',
  'mercimek': 'mercimek',
  'kuru fasulye': 'kuru-fasulye',
  'fasulye': 'kuru-fasulye',
  'salca': 'salca',
  'tarhana': 'tarhana',
};

/** Doğrulanmış Unsplash fallback (yerel henüz indirilmeyen 20 temel ürün için) */
const VERIFIED_UNSPLASH_FALLBACK: Record<string, string> = {
  kasar:      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
  peynir:     'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400&auto=format&fit=crop&q=80',
  yogurt:     'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80',
  sut:        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  tereyagi:   'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80',
  domates:    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  salatalik:  'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop&q=80',
  patates:    'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400&auto=format&fit=crop&q=80',
  havuc:      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80',
  ispanak:    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80',
  sogan:      'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&auto=format&fit=crop&q=80',
  sarimsak:   'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop&q=80',
  brokoli:    'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80',
  karnabahar: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop&q=80',
  misir:      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=80',
  pancar:     'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&auto=format&fit=crop&q=80',
  kuskonmaz:  'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=400&auto=format&fit=crop&q=80',
  tavuk:      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
  pilic:      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
  makarna:    'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&auto=format&fit=crop&q=80',
  pirinc:     'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
  elma:       'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
  muz:        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
  portakal:   'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&auto=format&fit=crop&q=80',
  limon:      'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&auto=format&fit=crop&q=80',
  karpuz:     'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80',
  bal:        'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400&auto=format&fit=crop&q=80',
  un:         'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=400&auto=format&fit=crop&q=80',
  yumurta:    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80',
  nohut:      'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&auto=format&fit=crop&q=80',
  zeytinyagi: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
};

const CATEGORY_FALLBACK: Record<FoodCategory, string> = {
  'Süt Ürünü':  VERIFIED_UNSPLASH_FALLBACK.peynir,
  'Unlu Mamul': VERIFIED_UNSPLASH_FALLBACK.un,
  'Sebze':      VERIFIED_UNSPLASH_FALLBACK.domates,
  'Şarküteri':  VERIFIED_UNSPLASH_FALLBACK.kasar,
  'Et & Tavuk': VERIFIED_UNSPLASH_FALLBACK.tavuk,
  'Meyve':      VERIFIED_UNSPLASH_FALLBACK.elma,
  'Kiler':      VERIFIED_UNSPLASH_FALLBACK.yumurta,
};

const DEFAULT_IMAGE = VERIFIED_UNSPLASH_FALLBACK.domates;

/**
 * Malzeme adı veya ID'sine göre yerel ImageSourcePropType (require) döndürür.
 * Yerel dosya bulunamazsa null döner.
 */
export function getLocalIngredientAsset(nameOrId: string): ImageSourcePropType | null {
  const norm = normalizeTurkish(nameOrId).trim();

  // 1. Doğrudan dosya adı / ID kontrolü (örn. "kiyma", "suzme-yogurt")
  if (INGREDIENT_ASSETS[norm]) {
    return INGREDIENT_ASSETS[norm];
  }

  // 2. Anahtar kelime haritası kontrolü (örn. "Süzme Yoğurt" -> "suzme-yogurt")
  if (INGREDIENT_KEY_MAP[norm] && INGREDIENT_ASSETS[INGREDIENT_KEY_MAP[norm]]) {
    return INGREDIENT_ASSETS[INGREDIENT_KEY_MAP[norm]];
  }

  // 3. İçerik taraması (örn. "Dana Kuşbaşı Kıyma" içinde "kiyma" geçiyor mu?)
  for (const [key, assetKey] of Object.entries(INGREDIENT_KEY_MAP)) {
    if (norm.includes(key) && INGREDIENT_ASSETS[assetKey]) {
      return INGREDIENT_ASSETS[assetKey];
    }
  }

  // 4. Doğrudan asset anahtarlarında token kontrolü
  for (const assetKey of Object.keys(INGREDIENT_ASSETS)) {
    if (norm.includes(assetKey)) {
      return INGREDIENT_ASSETS[assetKey];
    }
  }

  return null;
}

/**
 * Tarif ID'sine veya adına göre yerel tarif görseli (require) döndürür.
 */
export function getLocalRecipeAsset(recipeIdOrTitle: string): ImageSourcePropType | null {
  // 1. Doğrudan recipe ID ile eşleşme (örn. "recipe-et-1")
  if (RECIPE_ASSETS[recipeIdOrTitle]) {
    return RECIPE_ASSETS[recipeIdOrTitle];
  }

  // 2. Başlık normalizasyonu ile eşleşme
  const norm = normalizeTurkish(recipeIdOrTitle).trim();
  const titleToId: Record<string, string> = {
    'tava kavurmasi': 'recipe-et-1',
    'kavurma': 'recipe-et-1',
    'sarimsakli tavuk sote': 'recipe-tavuk-1',
    'tavuk sote': 'recipe-tavuk-1',
    'citir tavada patates': 'recipe-patates-1',
    'citir patates': 'recipe-patates-1',
    'patates corbasi': 'recipe-patates-2',
    'kremamsi patates corbasi': 'recipe-patates-2',
    'sebze sote': 'recipe-sebze-1',
    'tavada sebze sote': 'recipe-sebze-1',
    'zeytinyagli kuskonmaz': 'recipe-kuskonmaz-1',
    'kuskonmaz': 'recipe-kuskonmaz-1',
    'mantar sote': 'recipe-mantar-1',
    'sarimsakli mantar sote': 'recipe-mantar-1',
    'menemen': 'recipe-menemen-1',
    'tavada hakiki menemen': 'recipe-menemen-1',
    'cacik': 'recipe-yogurt-1',
    'serinletici cacik': 'recipe-yogurt-1',
    'tavada citir kasarli ekmek': 'recipe-1',
    'kasarli ekmek': 'recipe-1',
    'yogurtlu ekmek mantisi': 'recipe-3',
    'ekmek mantisi': 'recipe-3',
    'domates soslu makarna': 'recipe-makarna-1',
    'makarna': 'recipe-makarna-1',
    'pisi': 'recipe-un-pisi-1',
    'anne pisisi': 'recipe-un-pisi-1',
    'kasik dokmesi': 'recipe-un-kasik-1',
    'peynirli kasik dokmesi': 'recipe-un-kasik-1',
    'akitma': 'recipe-un-krep-1',
    'krep': 'recipe-un-krep-1',
    'un corbasi': 'recipe-un-corba-1',
    'salcali un corbasi': 'recipe-un-corba-1',
    'su boregi': 'recipe-yufka-borek-1',
    'mucver': 'recipe-sebze-mucver-1',
    'kabak mucveri': 'recipe-sebze-mucver-1',
    'mercimek koftesi': 'recipe-bulgur-mercimek-1',
    'tarhana corbasi': 'recipe-tarhana-1',
    'tarhana': 'recipe-tarhana-1',
    'gozleme': 'recipe-gozleme-1',
    'bulgur pilavi': 'recipe-bulgur-pilav-1',
    'yumurtali ispanak': 'recipe-ispanak-yumurta-1',
    'patates boregi': 'recipe-patates-borek-1',
  };

  for (const [key, id] of Object.entries(titleToId)) {
    if (norm.includes(key) && RECIPE_ASSETS[id]) {
      return RECIPE_ASSETS[id];
    }
  }

  return null;
}

/**
 * Hem React Native Image bileşeninde hem de string bekleyen yerlerde çalışan görsel resolver
 * Geriye React Native Image'in kabul ettiği source formatını döndürür (number / require veya { uri: string })
 */
export function resolveFoodImageSource(
  source?: any,
  name?: string,
  category?: string
): ImageSourcePropType | { uri: string } | null {
  // 1. Eğer source doğrudan number (require) ise doğrudan döndür
  if (typeof source === 'number') {
    return source;
  }

  // 2. Eğer source bir string ve local anahtarsa veya "local:" ile başlıyorsa
  if (typeof source === 'string') {
    if (source.startsWith('local:')) {
      const key = source.replace('local:', '');
      const localAsset = INGREDIENT_ASSETS[key] || RECIPE_ASSETS[key];
      if (localAsset) return localAsset;
    }

    // Doğrudan ID eşleşmesi
    if (RECIPE_ASSETS[source]) return RECIPE_ASSETS[source];
    if (INGREDIENT_ASSETS[source]) return INGREDIENT_ASSETS[source];
  }

  // 3. İsimden yerel asset araması
  if (name) {
    const localRecipe = getLocalRecipeAsset(name);
    if (localRecipe) return localRecipe;

    const localIng = getLocalIngredientAsset(name);
    if (localIng) return localIng;
  }

  // 4. Eğer source geçerli bir http URL'si ise
  if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
    return { uri: source };
  }

  // 5. Fallback URL
  const fallbackUrl = resolveFoodImage(name || '', category as FoodCategory);
  return { uri: fallbackUrl };
}

/**
 * Ürün adına göre string URL veya yerel referans döndürür (Geriye dönük uyumluluk için)
 */
export function resolveFoodImage(name: string, category?: FoodCategory): string {
  const norm = normalizeTurkish(name).trim();

  // 1. Yerel indirilmiş malzemeyse local anahtar olarak işaretle
  for (const [key, assetKey] of Object.entries(INGREDIENT_KEY_MAP)) {
    if (norm.includes(key)) {
      return `local:${assetKey}`;
    }
  }

  // 2. Doğrulanmış Unsplash fallback araması
  for (const [key, url] of Object.entries(VERIFIED_UNSPLASH_FALLBACK)) {
    if (norm.includes(key)) {
      return url;
    }
  }

  // 3. Kategori Fallback
  if (category && CATEGORY_FALLBACK[category]) {
    return CATEGORY_FALLBACK[category];
  }

  return DEFAULT_IMAGE;
}
