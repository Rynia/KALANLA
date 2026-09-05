export type IngredientCategory =
  | 'Süt Ürünleri'
  | 'Fırın'
  | 'Sebze'
  | 'Temel Gıda'
  | 'Meyve'
  | 'Et & Şarküteri'
  | 'Genel';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  daysLeft: number;
  value: number;
  critical: boolean;
  unit?: string;
}

export interface CatalogIngredient {
  name: string;
  category: IngredientCategory;
  defaultDays: number;
  defaultValue: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  timeMin: number;
  savings: number;
  ingredientsUsed: string[];
  description: string;
  rescueLevel?: 'Acil' | 'Öncelikli' | 'Rahat';
}

export interface KitchenStats {
  totalValue: number;
  atRiskValue: number;
  savedValue: number;
}

export interface PersistedKitchenState {
  ingredients: Ingredient[];
  savedValue: number;
  completedRecipes: number;
}

export type Tab = 'see' | 'cook' | 'savings';
