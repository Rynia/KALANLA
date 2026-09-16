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
  base64Image: string,
  apiKey?: string
): Promise<ReceiptScanResult> {
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `Sen Türk perakende market fişleri (BİM, A101, ŞOK, Migros, CarrefourSA vb.) üzerinde uzmanlaşmış bir OCR ve gıda ayrıştırma motorusun.
Bu fiş fotoğrafındaki gıda maddelerini tespit et.

GÖREVLER:
1. Market adını tespit et (BİM, A101, ŞOK, MİGROS veya DİĞER).
2. GIDA DIŞI TÜM SATIRLARI ELE: 'POSET', 'DETERJAN', 'SABUN', 'KDV', 'TOPLAM', 'NAKIT', 'KREDI KARTI', 'BILGI FISIDIR' vb.
3. Market kısaltmalarını gerçek Türkçe gıda adlarına dönüştür:
   - 'KAS PEY' -> 'Kaşar Peyniri'
   - 'SALKIM DOM' -> 'Salkım Domates'
   - 'TAV GOG' -> 'Tavuk Göğsü'
   - 'UHT SUT 1L' -> 'Süt'
   - 'YUM M 15LI' -> 'Yumurta'
4. Miktar, fiyat ve buzdolabı saklama ömrünü tahmin et.

YALNIZCA SAF JSON ŞEMASIYLA YANIT VER:
{
  "marketName": "BİM",
  "totalTL": 285.50,
  "foods": [
    {
      "name": "Kaşar Peyniri",
      "category": "Süt Ürünü",
      "amount": "400g",
      "priceTL": 130,
      "shelfLifeDays": 15,
      "location": "Buzdolabı"
    }
  ]
}
Kategoriler: Süt Ürünü, Sebze, Meyve, Et & Tavuk, Şarküteri, Unlu Mamul, Kiler.
Konum: Buzdolabı, Dondurucu, Kiler.`;

      const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (Array.isArray(parsed.foods) && parsed.foods.length > 0) {
          return {
            marketName: parsed.marketName || 'Market Fişi',
            totalSavedOrSpentTL: parsed.totalTL || 0,
            items: mapToScannedFoods(parsed.foods),
          };
        }
      }
    } catch (e) {
      console.warn('[Receipt] Gemini OCR call failed:', e);
    }
  }

  // API Anahtarı veya Backend Proxy olmadan sahte veri basılmaz (Apple 2.3.1 & Store Dürüstlük Kuralı)
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

