// src/services/visionInventoryService.ts
// AI ile Fotoğraftan Mutfak Envanteri Çıkarıcı & Deterministik Doğrulama
import * as ImageManipulator from 'expo-image-manipulator';
import { FoodCategory, StorageLocation } from '../types/models';
import { resolveFoodImage } from '../utils/foodImageResolver';
import { normalizeUnit, ACTIVE_VISION_PROVIDER } from './vision/types';

export interface DetectedFoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  amount: string;
  location: StorageLocation;
  hoursLeft: number;
  riskPercentage: number;
  priceTL: number;
  imageUrl: string;
  selected: boolean;
}

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `Sen Türk evlerindeki buzdolabı, dondurucu ve kiler düzenini çok iyi bilen kıdemli bir Mutfak Envanteri Denetçisisin.
Fotoğraftaki yenilebilir tüm gıda maddelerini tespit et.

ÖNEMLİ KURALLAR:
1. Buzdolabı raflarını, plastik saklama kaplarını, kavanoz camını, klavyeyi, masayı veya tencereleri gıda sayma; içlerindeki yiyeceği tahmin et.
2. Görselde yenilebilir hiçbir gıda maddesi yoksa items dizisini tamamen boş bırak: { "items": [] }.
3. Yalnızca geçerli ve saf bir JSON nesnesi döndür:
{
  "items": [
    {
      "name": "Salkım Domates",
      "category": "Sebze",
      "amount": "4 Adet",
      "location": "Buzdolabı",
      "daysLeft": 4,
      "priceTL": 40
    }
  ]
}
Kategori değerleri: Süt Ürünü, Sebze, Meyve, Et & Tavuk, Şarküteri, Unlu Mamul, Kiler.
Konum: Buzdolabı, Dondurucu, Kiler.`;

/**
 * Görseli mobil performans, bellek sızıntısını önleme ve EXIF oryantasyonunu
 * düzeltmek için 1280px'e normalize edip sıkıştırır.
 */
export async function compressAndBase64(imageUri: string): Promise<string> {
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1280 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipResult.base64) {
    throw new Error('Görsel base64 formatına dönüştürülemedi.');
  }

  return manipResult.base64;
}

/**
 * Fotoğraftaki yiyecekleri OpenAI (gpt-4o-mini) veya yapılandırılmış sağlayıcı ile analiz eder.
 * Apple Store Guideline 2.3 kuralı gereğince:
 * Başarısızlık, timeout veya görselde gıda olmaması durumunda ASLA sahte mock malzeme üretmez.
 * Deterministik olarak boş dizi [] döner.
 */
export async function detectFoodItemsFromImage(
  _base64Data: string,
  _apiKey?: string
): Promise<DetectedFoodItem[]> {
  // v1.0 Google Play & Data Safety Uyum Kalkanı:
  // v1.0'da tüm kiler yerel cihazda çalışır, hiçbir görsel dış sunucuya aktarılmaz.
  // Gerçek AI Vision analiz motoru v1.1 ile güvenli backend proxy üzerinden sunulacaktır.
  return [];
}

function mapToDetectedFoodItems(rawItems: any[]): DetectedFoodItem[] {
  return rawItems.map((item, index) => {
    const days = item.daysLeft || 3;
    const hours = days * 24;
    const risk = hours <= 24 ? 92 : hours <= 48 ? 80 : hours <= 72 ? 65 : 30;

    return {
      id: `detected-${Date.now()}-${index}`,
      name: item.name || 'Gıda Maddesi',
      category: (item.category as FoodCategory) || 'Sebze',
      amount: normalizeUnit(item.amount || '1 Adet'),
      location: (item.location as StorageLocation) || 'Buzdolabı',
      hoursLeft: hours,
      riskPercentage: risk,
      priceTL: item.priceTL || 50,
      imageUrl: resolveFoodImage(item.name || '', item.category),
      selected: true,
    };
  });
}
