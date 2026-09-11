/**
 * DÜRÜM VE KAHVE ENDEKSİ (2026 Gerçekçi Türkiye Mutfak Benchmark'ı)
 * Soyut TL veya kg CO2 yerine kullanıcıya doğrudan dokunan somut değerler.
 */

export interface DurumEquivalence {
  durumCount: number;
  kahveCount: number;
  title: string;
  badgeEmoji: string;
  description: string;
}

// 2026 Ortalama Fiyat Kabulleri:
// 1 Tavuk Dürüm (Döner/Lavaş): ~160 TL
// 1 Filtre Kahve / Americano: ~85 TL
export const BENCHMARK_PRICES = {
  DURUM_TL: 160,
  KAHVE_TL: 85,
  MINIMUM_EXPENSE_DAY_TL: 350,
};

export function calculateDurumIndex(totalSavedTL: number): DurumEquivalence {
  const durumCount = Number((totalSavedTL / BENCHMARK_PRICES.DURUM_TL).toFixed(1));
  const kahveCount = Number((totalSavedTL / BENCHMARK_PRICES.KAHVE_TL).toFixed(1));

  let title = 'Mutfak Çırağı';
  let badgeEmoji = '🌱';
  let description = 'Henüz yolun başındasın, ama israfı durdurmaya başladın!';

  if (totalSavedTL >= 2000) {
    title = 'Mutfak Simyacısı';
    badgeEmoji = '👑';
    description = 'Dolaptaki her şeyi altına ve ziyafete çeviren usta şef!';
  } else if (totalSavedTL >= 1000) {
    title = 'Sıfır Atık Gurmesi';
    badgeEmoji = '⭐';
    description = 'Cebinde kalan parayla aylık kahve masrafını sildin!';
  } else if (totalSavedTL >= 450) {
    title = 'Bütçe Muhafızı';
    badgeEmoji = '🛡️';
    description = 'Haftalık dürüm ve atıştırmalık bütçeni kurtardın!';
  } else if (totalSavedTL >= 160) {
    title = 'Dürüm Şampiyonu';
    badgeEmoji = '🌯';
    description = 'İlk dürümünü bedavaya getirdin bile!';
  }

  return {
    durumCount,
    kahveCount,
    title,
    badgeEmoji,
    description,
  };
}
