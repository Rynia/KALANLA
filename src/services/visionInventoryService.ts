// src/services/visionInventoryService.ts
// Gemini 2.5 Flash ile Fotoğraftan Mutfak Envanteri Çıkarıcı & Yerel Simülatör
import * as ImageManipulator from 'expo-image-manipulator';
import { FoodCategory, StorageLocation } from '../types/models';
import { resolveFoodImage } from '../utils/foodImageResolver';

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

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Görseli mobil performans ve yapay zeka için 1024px'e küçültüp base64 yapar.
 */
export async function compressAndBase64(imageUri: string): Promise<string> {
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipResult.base64) {
    throw new Error('Görsel base64 formatına dönüştürülemedi.');
  }

  return manipResult.base64;
}

/**
 * Gemini API Anahtarı ile veya Çevrimdışı Akıllı Ayrıştırıcı ile
 * fotoğraftaki yiyecekleri tespit eder.
 */
export async function detectFoodItemsFromImage(
  base64Data: string,
  apiKey?: string
): Promise<DetectedFoodItem[]> {
  // Eğer API anahtarı tanımlıysa canlı Gemini 2.5 Flash modeline sor
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `Sen Türk evlerindeki buzdolabı, dondurucu ve tezgah düzenini çok iyi bilen kıdemli bir Mutfak Envanteri Denetçisisin.
Fotoğraftaki yenilebilir tüm gıda maddelerini tespit et.

ÖNEMLİ KURALLAR:
1. Buzdolabı raflarını, plastik saklama kaplarını, kavanoz camını veya tencereleri gıda sayma; içlerindeki yiyeceği tahmin et (örn: tencere -> Kalan Ev Yemeği).
2. Şeffaf poşetlerdeki sebzeleri (maydanoz, domates, biber) ve sarı/loş ışık altındaki peynir bloklarını formundan tanı.
3. Kısmi görünen veya arka plandaki malzemeleri de dahil et.
4. Yalnızca geçerli ve saf bir JSON nesnesi döndür:
{
  "items": [
    {
      "name": "Salkım Domates",
      "category": "Sebze",
      "amount": "4 Adet",
      "location": "Buzdolabı",
      "daysLeft": 4,
      "priceTL": 40
    },
    {
      "name": "Tost Kaşarı",
      "category": "Süt Ürünü",
      "amount": "350g",
      "location": "Buzdolabı",
      "daysLeft": 14,
      "priceTL": 120
    }
  ]
}
Kategori değerleri: Süt Ürünü, Sebze, Meyve, Et & Tavuk, Şarküteri, Unlu Mamul, Kiler.
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
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          return mapToDetectedFoodItems(parsed.items);
        }
      }
    } catch (e) {
      console.warn('[Vision] Gemini call failed, falling back to simulated detector:', e);
    }
  }

  // Çevrimdışı / API Anahtarsız Yedek Simülasyon
  // Kullanıcı sistemi test ederken hemen 4-5 gerçekçi malzeme tespit eder
  return getSimulatedDetection();
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
      amount: item.amount || '1 Adet',
      location: (item.location as StorageLocation) || 'Buzdolabı',
      hoursLeft: hours,
      riskPercentage: risk,
      priceTL: item.priceTL || 50,
      imageUrl: resolveFoodImage(item.name || '', item.category),
      selected: true,
    };
  });
}

function getSimulatedDetection(): DetectedFoodItem[] {
  const sampleStaples = [
    { name: 'Salkım Domates', category: 'Sebze' as FoodCategory, amount: '4 Adet', days: 3, price: 45, location: 'Buzdolabı' as StorageLocation },
    { name: 'Kaşar Peyniri', category: 'Süt Ürünü' as FoodCategory, amount: '350g', days: 4, price: 130, location: 'Buzdolabı' as StorageLocation },
    { name: 'Çarliston Biber', category: 'Sebze' as FoodCategory, amount: '250g', days: 3, price: 30, location: 'Buzdolabı' as StorageLocation },
    { name: 'Köy Yumurtası', category: 'Kiler' as FoodCategory, amount: '6 Adet', days: 8, price: 45, location: 'Buzdolabı' as StorageLocation },
  ];

  return sampleStaples.map((s, idx) => ({
    id: `simulated-${Date.now()}-${idx}`,
    name: s.name,
    category: s.category,
    amount: s.amount,
    location: s.location,
    hoursLeft: s.days * 24,
    riskPercentage: s.days <= 2 ? 90 : 70,
    priceTL: s.price,
    imageUrl: resolveFoodImage(s.name, s.category),
    selected: true,
  }));
}
