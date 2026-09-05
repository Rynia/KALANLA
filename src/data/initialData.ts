import { FoodItem, RescueRecipe, AchievementBadge } from '../types/models';

// Demo ürünler — yeni kurulum için temsili içerik
// Gerçek kullanıcı verileri AsyncStorage üzerinden yüklenir
export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'item-1',
    name: 'Yarım Kaşar Peyniri',
    category: 'Süt Ürünü',
    amount: '250g',
    location: 'Buzdolabı',
    hoursLeft: 18,
    riskPercentage: 92,
    priceTL: 120,
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
    addedAt: '2 gün önce',
    addedTimestamp: Date.now() - 2 * 24 * 3600_000,
    estimatedShelfLifeHours: 18,
  },
  {
    id: 'item-2',
    name: 'Taş Fırın Bayat Ekmek',
    category: 'Unlu Mamul',
    amount: '1 Adet',
    location: 'Kiler',
    hoursLeft: 24,
    riskPercentage: 85,
    priceTL: 25,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    addedAt: 'Dün',
    addedTimestamp: Date.now() - 24 * 3600_000,
    estimatedShelfLifeHours: 24,
  },
  {
    id: 'item-3',
    name: 'Salkım Domates',
    category: 'Sebze',
    amount: '3 Adet',
    location: 'Buzdolabı',
    hoursLeft: 36,
    riskPercentage: 78,
    priceTL: 60,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    addedAt: '3 gün önce',
    addedTimestamp: Date.now() - 3 * 24 * 3600_000,
    estimatedShelfLifeHours: 36,
  },
  {
    id: 'item-4',
    name: 'Organik Süzme Yoğurt',
    category: 'Şarküteri',
    amount: '500g',
    location: 'Buzdolabı',
    hoursLeft: 96,
    riskPercentage: 45,
    priceTL: 75,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
    addedAt: '5 gün önce',
    addedTimestamp: Date.now() - 5 * 24 * 3600_000,
    estimatedShelfLifeHours: 96,
  },
  {
    id: 'item-5',
    name: 'Dana Kıyma',
    category: 'Et & Tavuk',
    amount: '400g',
    location: 'Dondurucu',
    hoursLeft: 432,
    riskPercentage: 15,
    priceTL: 280,
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80',
    addedAt: '1 hafta önce',
    addedTimestamp: Date.now() - 7 * 24 * 3600_000,
    estimatedShelfLifeHours: 432,
  },
  {
    id: 'item-6',
    name: 'Taze Maydanoz',
    category: 'Sebze',
    amount: '1 Demet',
    location: 'Buzdolabı',
    hoursLeft: 48,
    riskPercentage: 70,
    priceTL: 20,
    imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a61dd75?w=400&auto=format&fit=crop&q=80',
    addedAt: '4 gün önce',
    addedTimestamp: Date.now() - 4 * 24 * 3600_000,
    estimatedShelfLifeHours: 48,
  },
  {
    id: 'item-7',
    name: 'Köy Yumurtası',
    category: 'Kiler',
    amount: '6 Adet',
    location: 'Buzdolabı',
    hoursLeft: 192,
    riskPercentage: 25,
    priceTL: 45,
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80',
    addedAt: '3 gün önce',
    addedTimestamp: Date.now() - 3 * 24 * 3600_000,
    estimatedShelfLifeHours: 192,
  },
  {
    id: 'item-8',
    name: 'Gemlik Sele Zeytin',
    category: 'Şarküteri',
    amount: '300g',
    location: 'Buzdolabı',
    hoursLeft: 480,
    riskPercentage: 10,
    priceTL: 85,
    imageUrl: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&auto=format&fit=crop&q=80',
    addedAt: '6 gün önce',
    addedTimestamp: Date.now() - 6 * 24 * 3600_000,
    estimatedShelfLifeHours: 480,
  }
];

// ─────────────────────────────────────────────────────────────────────
// GENİŞLETİLMİŞ TARİF KATALOĞU — 14 tarif, geniş malzeme yelpazesi
// Her tarif: Türk mutfağına uygun, hızlı, kiler/dolap odaklı
// ─────────────────────────────────────────────────────────────────────
export const INITIAL_RECIPES: RescueRecipe[] = [
  // ── ET & TAVUK ──────────────────────────────────────────────────
  {
    id: 'recipe-et-1',
    title: 'Tava Kavurması',
    description: 'Et, soğan ve biberle 15 dakikada hazırlanan klasik Türk kavurması. Kalan eti en hızlı ve lezzetli şekilde değerlendirmenin yolu.',
    durationMinutes: 15,
    savedTL: 250,
    matchPercentage: 0,
    calories: 380,
    protein: '28g',
    imageUrl: 'https://images.unsplash.com/photo-1588347818036-c2e6b5f01f48?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Et', rescued: false, consumeAmount: '200' },
      { name: 'Soğan', rescued: false, isPantry: true },
    ],
    instructions: [
      'Eti küp küp doğrayın, oda sıcaklığına getirin.',
      'Kuru bir tavada yüksek ateşte et suyunu çekene kadar kavurun.',
      'İnce kıyılmış soğanı ekleyin, hafif kızarana kadar soteleyin.',
      'Biber, tuz ve pul biber ekleyin. 3-4 dakika daha pişirin.',
      'Üzerine taze yeşillik serperek sıcak servis yapın.'
    ],
    co2SavedKg: 1.8,
    isChefPick: false,
  },
  {
    id: 'recipe-tavuk-1',
    title: 'Sarımsaklı Tavuk Sote',
    description: 'Tavuk parçalarını sarımsak ve zeytinyağıyla kısa sürede hazırlayın. Yanında pilav veya ekmekle mükemmel.',
    durationMinutes: 18,
    savedTL: 200,
    matchPercentage: 0,
    calories: 320,
    protein: '32g',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Tavuk', rescued: false, consumeAmount: '250' },
      { name: 'Sarımsak', rescued: false, isPantry: true },
    ],
    instructions: [
      'Tavuğu lokmalık parçalara bölün, tuzlayın.',
      'Zeytinyağlı tavada yüksek ateşte her yüzünü mühürleyin.',
      'Ezilmiş sarımsakları ekleyin, 1 dakika kavurun.',
      'Yarım çay bardağı su ekleyip kısık ateşte 8 dakika pişirin.',
      'Dilediğiniz yeşilliklerle süsleyip servis yapın.'
    ],
    co2SavedKg: 1.4,
  },

  // ── SEBZE ────────────────────────────────────────────────────────
  {
    id: 'recipe-patates-1',
    title: 'Çıtır Tavada Patates',
    description: 'Patateslerinizi birkaç dakikada çıtır çıtır kızartın. Kahvaltıdan akşam yemeğine her öğüne yakışır.',
    durationMinutes: 12,
    savedTL: 110,
    matchPercentage: 0,
    calories: 280,
    protein: '5g',
    imageUrl: 'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Patates', rescued: false, consumeAmount: '250' },
      { name: 'Zeytinyağı', rescued: false, isPantry: true },
    ],
    instructions: [
      'Patatesleri ince dilimleyin veya küpler halinde doğrayın.',
      'Bol sıvı yağda kızgın tavada altın sarısı renk alana kadar kızartın.',
      'Kağıt havluya alıp yağını çektirin.',
      'Tuz, pul biber ve kekikle tatlandırarak servis yapın.'
    ],
    co2SavedKg: 0.6,
    isChefPick: false,
  },
  {
    id: 'recipe-patates-2',
    title: 'Patates Çorbası',
    description: 'Kremamsız ama kremsi! Patateslerinizi 20 dakikada kadifemsi bir çorbaya dönüştürün.',
    durationMinutes: 20,
    savedTL: 130,
    matchPercentage: 0,
    calories: 210,
    protein: '6g',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Patates', rescued: false, consumeAmount: '300' },
      { name: 'Soğan', rescued: false, isPantry: true },
    ],
    instructions: [
      'Patatesleri ve soğanı küpler halinde doğrayın.',
      'Tencerede yağda soğanı pembeleştirin.',
      'Patatesleri ekleyip 2 dakika karıştırın.',
      '3 su bardağı et veya sebze suyu ekleyip yumuşayana kadar pişirin.',
      'Blender ile pürüzsüz kıvama getirin, tuz-karabiber ekleyin.'
    ],
    co2SavedKg: 0.8,
  },
  {
    id: 'recipe-sebze-1',
    title: 'Sebze Sote',
    description: 'Dolapta ne varsa atın! Biber, kabak, patlıcan, havuç — her sebze bu sotede mükemmel.',
    durationMinutes: 10,
    savedTL: 90,
    matchPercentage: 0,
    calories: 140,
    protein: '4g',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Domates', rescued: false, consumeAmount: '2' },
      { name: 'Biber', rescued: false, consumeAmount: '2' },
    ],
    instructions: [
      'Sebzeleri büyük parçalara doğrayın.',
      'Zeytinyağlı tavada yüksek ateşte 3-4 dakika atın.',
      'Domates ekleyip suyunu çekene kadar pişirin.',
      'Tuz, kekik ve pul biberle tatlandırın.',
      'Yanında ekmek veya pilav ile servis yapın.'
    ],
    co2SavedKg: 0.5,
  },
  {
    id: 'recipe-kuskonmaz-1',
    title: 'Zeytinyağlı Kuşkonmaz',
    description: 'Kuşkonmazları limon ve zeytinyağıyla 8 dakikada hazırlayın. Hem hafif hem besleyici.',
    durationMinutes: 8,
    savedTL: 120,
    matchPercentage: 0,
    calories: 120,
    protein: '5g',
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Kuşkonmaz', rescued: false, consumeAmount: '200' },
      { name: 'Limon', rescued: false, isPantry: true },
    ],
    instructions: [
      'Kuşkonmazların sert köklerini kırın.',
      'Zeytinyağlı ızgara tavada 3-4 dakika çevirin.',
      'Tuz ve limon suyu sıkın.',
      'Üzerine pul biber serperek servis yapın.'
    ],
    co2SavedKg: 0.4,
  },
  {
    id: 'recipe-mantar-1',
    title: 'Sarımsaklı Mantar Sote',
    description: 'Mantarları sarımsak ve tereyağıyla birkaç dakikada sote edin. Kahvaltı veya ana yemek yanı.',
    durationMinutes: 8,
    savedTL: 95,
    matchPercentage: 0,
    calories: 160,
    protein: '6g',
    imageUrl: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Mantar', rescued: false, consumeAmount: '200' },
      { name: 'Sarımsak', rescued: false, isPantry: true },
    ],
    instructions: [
      'Mantarları dilimleyin.',
      'Tereyağlı tavada yüksek ateşte suyunu çekene kadar kavurun.',
      'Ezilmiş sarımsak ekleyip 1 dakika daha kavurun.',
      'Maydanoz ve limon suyuyla servis yapın.'
    ],
    co2SavedKg: 0.35,
  },

  // ── SÜT ÜRÜNLERİ & YUMURTA ──────────────────────────────────────
  {
    id: 'recipe-menemen-1',
    title: 'Klasik Menemen',
    description: 'Domates, biber ve yumurtanın mükemmel buluşması. Türkiyenin en sevilen sabah yemeği.',
    durationMinutes: 12,
    savedTL: 180,
    matchPercentage: 0,
    calories: 285,
    protein: '14g',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Domates', rescued: false, consumeAmount: '2' },
      { name: 'Yumurta', rescued: false, consumeAmount: '3' },
      { name: 'Biber', rescued: false, isPantry: true },
    ],
    instructions: [
      'Biberleri ince doğrayın, zeytinyağlı tavada kavurun.',
      'Domatesleri ekleyin, suyunu çekene kadar pişirin.',
      'Yumurtaları kırın, karıştırmadan yavaşça pişirin.',
      'Tuz ve pul biber ekleyip servis yapın.'
    ],
    co2SavedKg: 0.95,
  },
  {
    id: 'recipe-yogurt-1',
    title: 'Cacık',
    description: 'Süzme yoğurt, sarımsak ve salatalıkla 5 dakikada hazırlanan serinletici cacık.',
    durationMinutes: 5,
    savedTL: 75,
    matchPercentage: 0,
    calories: 120,
    protein: '8g',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Yoğurt', rescued: false, consumeAmount: '250' },
      { name: 'Salatalık', rescued: false, consumeAmount: '1' },
    ],
    instructions: [
      'Salatalığı rendeleyin veya küçük küpler kesin.',
      'Yoğurtla karıştırın.',
      'Ezilmiş sarımsak, tuz ve zeytinyağı ekleyin.',
      'Üzerine nane serperek servis yapın.'
    ],
    co2SavedKg: 0.3,
  },

  // ── EKMEK & UNLU ─────────────────────────────────────────────────
  {
    id: 'recipe-1',
    title: 'Tavada Çıtır Kaşarlı Domatesli Ekmek',
    description: 'Bayat ekmek dilimlerini zeytinyağında çıtırdatıp eriyen kaşar ve közlenmiş domates dilimleriyle 6 dakikada buluşturun.',
    durationMinutes: 9,
    savedTL: 205,
    matchPercentage: 0,
    calories: 340,
    protein: '18g',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Bayat Ekmek', rescued: false, consumeAmount: '1' },
      { name: 'Kaşar Peyniri', rescued: false, consumeAmount: '150' },
      { name: 'Domates', rescued: false, consumeAmount: '2' },
    ],
    instructions: [
      'Bayat ekmekleri 1.5 cm kalınlığında verev dilimleyin.',
      'Döküm tavayı kızdırın, zeytinyağı gezdirip ekmeklerin bir yüzünü 2 dakika kızartın.',
      'Çevirdiğiniz yüzeye domates dilimleri ve kaşar peyniri koyun.',
      'Kapağı kapatıp 3 dakika peynir eriyene kadar pişirin.',
      'Pul biber serperek sıcak servis yapın.'
    ],
    co2SavedKg: 1.24,
    isChefPick: true,
  },
  {
    id: 'recipe-3',
    title: 'Yoğurt Soslu Kıymalı Bayat Ekmek Mantısı',
    description: 'Fırında gevretilmiş çıtır ekmek küpleri üzerine sarımsaklı yoğurt ve baharatlı kıyma sosu.',
    durationMinutes: 14,
    savedTL: 325,
    matchPercentage: 0,
    calories: 420,
    protein: '24g',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Bayat Ekmek', rescued: false, consumeAmount: '1' },
      { name: 'Dana Kıyma', rescued: false, consumeAmount: '200' },
      { name: 'Süzme Yoğurt', rescued: false, consumeAmount: '200' },
    ],
    instructions: [
      'Bayat ekmekleri lokmalık küpler halinde fırında çıtırlaştırın.',
      'Kıymayı az soğan ve salçayla kavurun.',
      'Yoğurdu sarımsak ve suyla pürüzsüz kıvama getirin.',
      'Tabağa ekmek, yoğurt, kıyma sosunu sırasıyla dizin.',
      'Tereyağında yaktığınız naneyle servis yapın.'
    ],
    co2SavedKg: 2.10,
  },
  {
    id: 'recipe-makarna-1',
    title: 'Domates Soslu Makarna',
    description: 'Dolaptaki taze domatesleri sosise çevirip üzerine makarna dökün. 15 dakikada tam öğün.',
    durationMinutes: 15,
    savedTL: 140,
    matchPercentage: 0,
    calories: 360,
    protein: '12g',
    imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Domates', rescued: false, consumeAmount: '3' },
      { name: 'Makarna', rescued: false, isPantry: true },
    ],
    instructions: [
      'Makarnayı tuzlu suda haşlayın.',
      'Domatesler küp küp doğrayın, zeytinyağında 10 dakika sos haline getirin.',
      'Tuz, şeker, fesleğen ekleyin.',
      'Süzdüğünüz makarnayı sosla karıştırın.',
      'Üzerine rendelenmiş peynir serperek servis yapın.'
    ],
    co2SavedKg: 0.9,
  },
  {
    id: 'recipe-4',
    title: 'Tarçınlı Çıtır Ekmek Dilimleri',
    description: 'Kalan ekmek dilimlerini hafif tereyağı ve tarçınla fırınlayarak 7 dakikada çıtır tatlı.',
    durationMinutes: 7,
    savedTL: 65,
    matchPercentage: 0,
    calories: 190,
    protein: '4g',
    imageUrl: 'https://images.unsplash.com/photo-1484723091739-00a699888947?w=600&auto=format&fit=crop&q=80',
    matchedItemNames: [],
    requiredItemNames: [
      { name: 'Bayat Ekmek', rescued: false, consumeAmount: '1' },
      { name: 'Tarçın', rescued: false, isPantry: true },
    ],
    instructions: [
      'Bayat ekmek dilimlerine yumuşamış tereyağı sürün.',
      'Üzerine tarçın ve az toz şeker serpiştirin.',
      '200°C fırında 6-7 dakika çıtırlaşana kadar fırınlayın.'
    ],
    co2SavedKg: 0.35,
  },
];

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge-1',
    title: 'Sıfır Ziyan Ustası',
    rank: 'ALTIN',
    description: '4 gün ardışık kurtarma tamamlandı',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'badge-2',
    title: 'Dolap Hakimi',
    rank: 'PLATİN',
    description: 'Envanterinde hiç çürüyen gıda kalmadı',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'badge-3',
    title: 'Hızlı Şef',
    rank: 'GÜMÜŞ',
    description: '10 dk altı 5 kurtarma yemeği',
    icon: '⚡',
    unlocked: false,
    progress: '0/5 İLERLEME',
  }
];

export interface TurkishStapleSuggestion {
  name: string;
  category: FoodItem['category'];
  icon: string;
  defaultPrice: number;
  defaultDays: number;
  defaultAmount: number;
  unit: string;
  location: FoodItem['location'];
}

export const TURKISH_STAPLES: TurkishStapleSuggestion[] = [
  { name: 'Kaşar Peyniri', category: 'Süt Ürünü', icon: '🧀', defaultPrice: 120, defaultDays: 3, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Bayat Ekmek', category: 'Unlu Mamul', icon: '🥖', defaultPrice: 25, defaultDays: 2, defaultAmount: 1, unit: 'Adet', location: 'Kiler' },
  { name: 'Domates', category: 'Sebze', icon: '🍅', defaultPrice: 35, defaultDays: 4, defaultAmount: 500, unit: 'g', location: 'Buzdolabı' },
  { name: 'Patates', category: 'Sebze', icon: '🥔', defaultPrice: 50, defaultDays: 7, defaultAmount: 500, unit: 'g', location: 'Kiler' },
  { name: 'Soğan', category: 'Sebze', icon: '🧅', defaultPrice: 20, defaultDays: 14, defaultAmount: 500, unit: 'g', location: 'Kiler' },
  { name: 'Biber', category: 'Sebze', icon: '🫑', defaultPrice: 30, defaultDays: 4, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Salatalık', category: 'Sebze', icon: '🥒', defaultPrice: 25, defaultDays: 4, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Mantar', category: 'Sebze', icon: '🍄', defaultPrice: 65, defaultDays: 3, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Havuç', category: 'Sebze', icon: '🥕', defaultPrice: 20, defaultDays: 10, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Kuşkonmaz', category: 'Sebze', icon: '🥦', defaultPrice: 80, defaultDays: 3, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Süzme Yoğurt', category: 'Şarküteri', icon: '🥛', defaultPrice: 65, defaultDays: 5, defaultAmount: 500, unit: 'g', location: 'Buzdolabı' },
  { name: 'Dana Kıyma', category: 'Et & Tavuk', icon: '🥩', defaultPrice: 220, defaultDays: 2, defaultAmount: 400, unit: 'g', location: 'Buzdolabı' },
  { name: 'Tavuk Göğsü', category: 'Et & Tavuk', icon: '🍗', defaultPrice: 180, defaultDays: 2, defaultAmount: 400, unit: 'g', location: 'Buzdolabı' },
  { name: 'Et', category: 'Et & Tavuk', icon: '🥩', defaultPrice: 350, defaultDays: 2, defaultAmount: 300, unit: 'g', location: 'Dondurucu' },
  { name: 'Taze Maydanoz', category: 'Sebze', icon: '🥬', defaultPrice: 15, defaultDays: 3, defaultAmount: 1, unit: 'Demet', location: 'Buzdolabı' },
  { name: 'Köy Yumurtası', category: 'Kiler', icon: '🥚', defaultPrice: 50, defaultDays: 10, defaultAmount: 6, unit: 'Adet', location: 'Buzdolabı' },
  { name: 'Sele Zeytin', category: 'Şarküteri', icon: '🫒', defaultPrice: 85, defaultDays: 25, defaultAmount: 300, unit: 'g', location: 'Buzdolabı' },
  { name: 'Çarliston Biber', category: 'Sebze', icon: '🫑', defaultPrice: 30, defaultDays: 4, defaultAmount: 250, unit: 'g', location: 'Buzdolabı' },
  { name: 'Kuru Soğan', category: 'Sebze', icon: '🧅', defaultPrice: 20, defaultDays: 14, defaultAmount: 1, unit: 'kg', location: 'Kiler' },
  { name: 'Makarna', category: 'Kiler', icon: '🍝', defaultPrice: 40, defaultDays: 365, defaultAmount: 500, unit: 'g', location: 'Kiler' },
];
