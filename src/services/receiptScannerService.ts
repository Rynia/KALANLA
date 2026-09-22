// src/services/receiptScannerService.ts
// Türk Market Fişleri (BİM, A101, ŞOK, MİGROS) OCR & Gıda Normalizasyon Servisi
import * as ImageManipulator from 'expo-image-manipulator';
import { FoodCategory, StorageLocation } from '../types/models';
import { resolveFoodImage } from '../utils/foodImageResolver';

export interface ScannedReceiptFood {
  id: string;
  name: string;
  category: FoodCategory;
  amount: string;
  location: StorageLocation;
  priceTL: number;
  hoursLeft: number;
  riskPercentage: number;
  imageUrl: string;
  selected: boolean;
}

export interface ReceiptScanResult {
  marketName: string;
  totalSavedOrSpentTL: number;
  items: ScannedReceiptFood[];
}

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Fiş fotoğrafını okuma ve yapay zeka için optimize eder (1280px).
 */
export async function prepareReceiptImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!result.base64) {
    throw new Error('Fiş görseli base64 formatına dönüştürülemedi.');
  }

  return result.base64;
}

/**
 * Fiş fotoğrafını Gemini veya yerel Türk market parserı ile analiz eder.
 */
export async function parseMarketReceipt(
  _base64Image: string,
  _apiKey?: string
): Promise<ReceiptScanResult> {
  // v1.0 Google Play & Data Safety Uyum Kalkanı:
  // Fiş görseli hiçbir dış sunucuya gönderilmez.
  // v1.1 ile güvenli backend proxy ve on-device ML Kit OCR üzerinden aktifleşecektir.
  return {
    marketName: '',
    totalSavedOrSpentTL: 0,
    items: [],
  };
}

function mapToScannedFoods(rawFoods: any[]): ScannedReceiptFood[] {
  return rawFoods.map((f, idx) => {
    const days = f.shelfLifeDays || 5;
    const hours = days * 24;
    const risk = hours <= 48 ? 85 : hours <= 96 ? 60 : 25;

    return {
      id: `receipt-item-${Date.now()}-${idx}`,
      name: f.name || 'Market Gıdası',
      category: (f.category as FoodCategory) || 'Sebze',
      amount: f.amount || '1 Adet',
      location: (f.location as StorageLocation) || 'Buzdolabı',
      priceTL: f.priceTL || 50,
      hoursLeft: hours,
      riskPercentage: risk,
      imageUrl: resolveFoodImage(f.name || '', f.category),
      selected: true,
    };
  });
}

