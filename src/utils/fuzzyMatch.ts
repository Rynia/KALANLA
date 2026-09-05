// src/utils/fuzzyMatch.ts
// Client-side lightweight Levenshtein typo-tolerance for Turkish staples
import { TURKISH_STAPLES, TurkishStapleSuggestion } from '../data/initialData';

function normalizeTr(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/**
 * Levenshtein mesafe algoritması
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // silme
        dp[i][j - 1] + 1,      // ekleme
        dp[i - 1][j - 1] + cost // değiştirme
      );
    }
  }

  return dp[m][n];
}

/**
 * Kullanıcı "domat", "donat", "ekmet", "kasar" gibi hatalı yazdığında
 * en yakın gıda önerisini döndürür.
 */
export function findTypoSuggestion(input: string): TurkishStapleSuggestion | null {
  const clean = normalizeTr(input);
  if (clean.length < 3) return null;

  // Zaten tam eşleşen varsa öneriye gerek yok
  const exact = TURKISH_STAPLES.find((s) => normalizeTr(s.name) === clean);
  if (exact) return null;

  let bestMatch: TurkishStapleSuggestion | null = null;
  let minDistance = 999;

  for (const staple of TURKISH_STAPLES) {
    const target = normalizeTr(staple.name);

    // Kısmi başlangıç kontrolü (örn: "domat" -> "domates")
    if (target.startsWith(clean) || clean.startsWith(target)) {
      return staple;
    }

    const dist = levenshteinDistance(clean, target);
    // İzin verilen maksimum hata mesafesi (kelime uzunluğuna göre 1-2 harf)
    const maxAllowed = clean.length <= 4 ? 1 : 2;

    if (dist <= maxAllowed && dist < minDistance) {
      minDistance = dist;
      bestMatch = staple;
    }
  }

  return bestMatch;
}
