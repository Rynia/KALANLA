import { FoodCategory } from '../../types/models';

export type CanonicalUnit = 'adet' | 'gram' | 'paket' | 'demet' | 'litre';

export interface DetectedStagingItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: CanonicalUnit;
  estimatedDaysToExpiry: number;
  confidence: number;
  isSelected: boolean;
}

export type VisionProviderType = 'openai' | 'cloud-vision' | 'gemini';

// Production Kilitli Varsayılan Sağlayıcı: OpenAI (gpt-4o-mini Vision)
// Google AI Studio tüketici (consumer) kısıtı riskinden tamamen arındırılmıştır.
export const ACTIVE_VISION_PROVIDER: VisionProviderType = 'openai';

export interface VisionProvider {
  name: VisionProviderType;
  analyzeFridge(imageBase64: string, signal?: AbortSignal): Promise<DetectedStagingItem[]>;
}

/**
 * Normalizes raw vision AI responses to standardized Turkish kitchen units
 */
export const normalizeUnit = (rawUnit: string): CanonicalUnit => {
  const clean = (rawUnit || '').toLocaleLowerCase('tr-TR').trim();
  if (['kg', 'kilo', 'gram', 'gr', 'g'].some((u) => clean.includes(u))) return 'gram';
  if (['lt', 'litre', 'l', 'ml'].some((u) => clean.includes(u))) return 'litre';
  if (['paket', 'koli', 'kutu', 'kalıp'].some((u) => clean.includes(u))) return 'paket';
  if (['demet', 'bağ'].some((u) => clean.includes(u))) return 'demet';
  return 'adet';
};
