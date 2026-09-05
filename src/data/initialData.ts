import { Ingredient, Recipe, CatalogIngredient } from '../types/models';

export const initialIngredients: Ingredient[] = [
  { id: '1', name: 'Yarım Kaşar Peyniri', category: 'Süt Ürünleri', daysLeft: 1, value: 140, critical: true },
  { id: '2', name: 'Bayat Ekmek (1 Adet)', category: 'Fırın', daysLeft: 1, value: 20, critical: true },
  { id: '3', name: 'Yumuşamış Domates (3 Adet)', category: 'Sebze', daysLeft: 2, value: 45, critical: true },
  { id: '4', name: 'Yarım Sıvı Krema', category: 'Süt Ürünleri', daysLeft: 2, value: 65, critical: true },
  { id: '5', name: 'Yumurta (4 Adet)', category: 'Temel Gıda', daysLeft: 6, value: 40, critical: false },
  { id: '6', name: 'Süzme Yoğurt', category: 'Süt Ürünleri', daysLeft: 5, value: 75, critical: false },
];

export const initialRecipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Tavada Çıtır Kaşarlı Domatesli Ekmek',
    timeMin: 9,
    savings: 205,
    rescueLevel: 'Acil',
    ingredientsUsed: ['Bayat Ekmek', 'Kaşar Peyniri', 'Domates'],
    description: 'Bayat ekmekleri dilimleyip tavada hafif tereyağında kızartın. Üzerine ezilmiş domates ve kaşarları ekleyip kapağını 3 dakika kapatın.'
  },
  {
    id: 'r2',
    title: 'Kremalı Fırın Makarna & Peynir Graten',
    timeMin: 14,
    savings: 270,
    rescueLevel: 'Öncelikli',
    ingredientsUsed: ['Yarım Sıvı Krema', 'Kaşar Peyniri'],
    description: 'Haşlanmış makarnayı yarım krema ve rendelenmiş kaşarla karıştırıp fırın kabına dökün. Üstü kızarana kadar 10 dakika fırınlayın.'
  },
  {
    id: 'r3',
    title: '10 Dakikalık Pratik Domatesli Şakşuka Omlet',
    timeMin: 8,
    savings: 85,
    rescueLevel: 'Acil',
    ingredientsUsed: ['Domates', 'Yumurta'],
    description: 'Yumuşamış domatesleri tavada zeytinyağı ile hafif ezin, yumurtaları kırıp karıştırın. Taze kekikle servis edin.'
  }
];

// Türk Mutfağı Sık Kullanılan Gıda Kataloğu (Hızlı Arama & Otomatik Tamamlama)
export const commonIngredientsCatalog: CatalogIngredient[] = [
  // Süt & Şarküteri
  { name: 'Kaşar Peyniri', category: 'Süt Ürünleri', defaultDays: 4, defaultValue: 120, unit: '250g' },
  { name: 'Beyaz Peynir', category: 'Süt Ürünleri', defaultDays: 5, defaultValue: 95, unit: '300g' },
  { name: 'Süzme Yoğurt', category: 'Süt Ürünleri', defaultDays: 5, defaultValue: 65, unit: '500g' },
  { name: 'Süt', category: 'Süt Ürünleri', defaultDays: 2, defaultValue: 35, unit: '1L' },
  { name: 'Sıvı Krema', category: 'Süt Ürünleri', defaultDays: 2, defaultValue: 55, unit: '200ml' },
  { name: 'Tereyağı', category: 'Süt Ürünleri', defaultDays: 14, defaultValue: 80, unit: '150g' },
  { name: 'Lor Peyniri', category: 'Süt Ürünleri', defaultDays: 3, defaultValue: 45, unit: '250g' },

  // Sebze & Yeşillik
  { name: 'Domates', category: 'Sebze', defaultDays: 3, defaultValue: 40, unit: '3 Adet' },
  { name: 'Salatalık', category: 'Sebze', defaultDays: 4, defaultValue: 30, unit: '3 Adet' },
  { name: 'Kuru Soğan', category: 'Sebze', defaultDays: 12, defaultValue: 25, unit: '3 Adet' },
  { name: 'Patates', category: 'Sebze', defaultDays: 10, defaultValue: 35, unit: '4 Adet' },
  { name: 'Biber (Sivri/Çarliston)', category: 'Sebze', defaultDays: 4, defaultValue: 30, unit: '4 Adet' },
  { name: 'Maydanoz', category: 'Sebze', defaultDays: 2, defaultValue: 15, unit: '1 Demet' },
  { name: 'Dereotu', category: 'Sebze', defaultDays: 2, defaultValue: 15, unit: '1 Demet' },
  { name: 'Ispanak', category: 'Sebze', defaultDays: 2, defaultValue: 40, unit: '500g' },
  { name: 'Mantar (Kültür)', category: 'Sebze', defaultDays: 2, defaultValue: 50, unit: '300g' },
  { name: 'Kabak', category: 'Sebze', defaultDays: 3, defaultValue: 35, unit: '2 Adet' },
  { name: 'Patlıcan', category: 'Sebze', defaultDays: 3, defaultValue: 40, unit: '2 Adet' },
  { name: 'Havuç', category: 'Sebze', defaultDays: 7, defaultValue: 25, unit: '3 Adet' },
  { name: 'Sarımsak', category: 'Sebze', defaultDays: 20, defaultValue: 20, unit: '1 Baş' },
  { name: 'Karnabahar', category: 'Sebze', defaultDays: 4, defaultValue: 60, unit: '1 Adet' },
  { name: 'Pırasa', category: 'Sebze', defaultDays: 4, defaultValue: 35, unit: '3 Dal' },

  // Fırın & Ekmek
  { name: 'Bayat Ekmek', category: 'Fırın', defaultDays: 1, defaultValue: 20, unit: '1 Adet' },
  { name: 'Lavaş / Yufka', category: 'Fırın', defaultDays: 2, defaultValue: 30, unit: '2 Yaprak' },
  { name: 'Tost Ekmeği', category: 'Fırın', defaultDays: 4, defaultValue: 35, unit: 'Yarım Paket' },

  // Et & Şarküteri
  { name: 'Kıyma', category: 'Et & Şarküteri', defaultDays: 1, defaultValue: 180, unit: '300g' },
  { name: 'Tavuk Göğsü', category: 'Et & Şarküteri', defaultDays: 1, defaultValue: 130, unit: '400g' },
  { name: 'Sucuk', category: 'Et & Şarküteri', defaultDays: 8, defaultValue: 110, unit: '10 Dilim' },
  { name: 'Sosis', category: 'Et & Şarküteri', defaultDays: 5, defaultValue: 60, unit: '5 Adet' },

  // Temel Gıda
  { name: 'Yumurta', category: 'Temel Gıda', defaultDays: 8, defaultValue: 40, unit: '4 Adet' },
  { name: 'Pirinç (Haşlanmış/Artan)', category: 'Temel Gıda', defaultDays: 2, defaultValue: 25, unit: '1 Kase' },
  { name: 'Makarna (Kalan)', category: 'Temel Gıda', defaultDays: 2, defaultValue: 25, unit: '1 Kase' },
  { name: 'Domates Salçası', category: 'Temel Gıda', defaultDays: 14, defaultValue: 30, unit: '3 Kaşık' },
  { name: 'Haşlanmış Nohut', category: 'Temel Gıda', defaultDays: 3, defaultValue: 30, unit: '1 Kase' },
  { name: 'Kırmızı Mercimek', category: 'Temel Gıda', defaultDays: 30, defaultValue: 35, unit: '1 Bardak' },

  // Meyve
  { name: 'Limon', category: 'Meyve', defaultDays: 10, defaultValue: 20, unit: '2 Adet' },
  { name: 'Elma', category: 'Meyve', defaultDays: 7, defaultValue: 30, unit: '3 Adet' },
  { name: 'Muz (Kararmaya Yakın)', category: 'Meyve', defaultDays: 2, defaultValue: 45, unit: '2 Adet' },
];
