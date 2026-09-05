import { Ingredient, Recipe } from '../types/models';

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
