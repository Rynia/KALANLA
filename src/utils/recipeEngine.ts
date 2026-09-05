// src/utils/recipeEngine.ts
// Dinamik tarif eşleştirme ve sıralama motoru
import { FoodItem, RescueRecipe } from '../types/models';

function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

/**
 * Fix 4: Token-based tam kelime eşleşmesi.
 * Eski çift-yönlü substring mantığı "sucuk" → "su", "bal" → "balik" gibi
 * yanlış eşleşmelere yol açıyordu. Artık:
 *   1. Tam eşleşme (normalize edilmiş)
 *   2. Token bazlı: her kelimenin diğer tarafın token listesinde tam geçmesi
 *   3. Min 3 karakter şartı — kısa token'lar atlanır
 */
function isMatch(itemName: string, requiredName: string): boolean {
  const normItem = normalize(itemName).trim();
  const normReq = normalize(requiredName).trim();

  // Tam eşleşme
  if (normItem === normReq) return true;

  const itemTokens = normItem.split(/\s+/);
  const reqTokens = normReq.split(/\s+/);

  // Korumalı false-positive çiftleri
  const falsePairs: [string, string][] = [
    ['su', 'sucuk'],
    ['bal', 'balik'],
  ];

  for (const it of itemTokens) {
    for (const rt of reqTokens) {
      if (it === rt) return true;

      // 2 harf veya daha uzun kök eşleşmesi (örn. 'et' <-> 'dana et', 'patates' <-> 'patatesler')
      if (it.length >= 2 && rt.length >= 2) {
        const isFalsePair = falsePairs.some(
          ([a, b]) => (it === a && rt === b) || (it === b && rt === a),
        );
        if (!isFalsePair && (it.startsWith(rt) || rt.startsWith(it))) {
          return true;
        }
      }
    }
  }

  return false;
}

function findMatch(required: string, inventory: FoodItem[], claimedIds: Set<string>): FoodItem | undefined {
  return inventory.find((item) => !claimedIds.has(item.id) && isMatch(item.name, required));
}

/**
 * Ana sıralama fonksiyonu.
 * Fix 6: claimedIds ile aynı envanter öğesinin birden fazla
 * gereksinimi karşılamasını engeller.
 */
export function scoreRecipes(inventory: FoodItem[], recipes: RescueRecipe[]): RescueRecipe[] {
  const scored = recipes.map((recipe) => {
    const nonPantryItems = recipe.requiredItemNames.filter((r) => !r.isPantry);
    const totalRequired = nonPantryItems.length;

    const matchedItems: FoodItem[] = [];
    const missingNames: string[] = [];
    // Fix 6: Her tarif için bağımsız bir claimed set
    const claimedIds = new Set<string>();

    nonPantryItems.forEach((req) => {
      const match = findMatch(req.name, inventory, claimedIds);
      if (match) {
        claimedIds.add(match.id);
        matchedItems.push(match);
      } else {
        missingNames.push(req.name);
      }
    });

    const matchCount = matchedItems.length;
    const matchPercentage =
      totalRequired === 0 ? 100 : Math.round((matchCount / totalRequired) * 100);

    const urgencyScore =
      matchedItems.length > 0
        ? Math.round(
            matchedItems.reduce((sum, item) => sum + item.riskPercentage, 0) / matchedItems.length,
          )
        : 0;

    // requiredItemNames'i dinamik olarak güncelle
    const globalClaimed = new Set<string>();
    const updatedRequiredItems = recipe.requiredItemNames.map((req) => {
      if (req.isPantry) return { ...req, rescued: false };
      const match = findMatch(req.name, inventory, globalClaimed);
      if (match) {
        globalClaimed.add(match.id);
        return { ...req, rescued: true };
      }
      return { ...req, rescued: false };
    });

    return {
      ...recipe,
      matchPercentage,
      urgencyScore,
      matchedItemNames: matchedItems.map((m) => m.name),
      missingItemNames: missingNames,
      requiredItemNames: updatedRequiredItems,
    };
  });

  scored.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
    if ((b.urgencyScore ?? 0) !== (a.urgencyScore ?? 0))
      return (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0);
    return b.savedTL - a.savedTL;
  });

  return scored;
}

export interface ConsumptionPlan {
  toRemove: string[];
  toUpdate: { id: string; newAmount: string }[];
}

/**
 * Kısmi tüketim planı.
 * Fix: isMatch'i kullanarak aynı token-based eşleşme mantığıyla çalışır.
 */
export function buildConsumptionPlan(
  recipe: RescueRecipe,
  inventory: FoodItem[],
): ConsumptionPlan {
  const toRemove: string[] = [];
  const toUpdate: { id: string; newAmount: string }[] = [];
  const usedIds = new Set<string>();

  recipe.requiredItemNames.forEach((req) => {
    if (req.isPantry) return;
    const found = inventory.find((item) => !usedIds.has(item.id) && isMatch(item.name, req.name));
    if (!found) return;
    usedIds.add(found.id);

    if (!req.consumeAmount) {
      toRemove.push(found.id);
      return;
    }

    const consumeNum = parseFloat(req.consumeAmount);
    const currentNum = parseFloat(found.amount);

    if (isNaN(consumeNum) || isNaN(currentNum)) {
      toRemove.push(found.id);
      return;
    }

    const remaining = currentNum - consumeNum;
    if (remaining <= 0) {
      toRemove.push(found.id);
    } else {
      const unitMatch = found.amount.match(/[^\d.]+/);
      const unit = unitMatch ? unitMatch[0].trim() : '';
      toUpdate.push({ id: found.id, newAmount: `${Math.round(remaining * 10) / 10}${unit}` });
    }
  });

  return { toRemove, toUpdate };
}

export function applyConsumptionPlan(
  inventory: FoodItem[],
  plan: ConsumptionPlan,
): FoodItem[] {
  return inventory
    .filter((item) => !plan.toRemove.includes(item.id))
    .map((item) => {
      const update = plan.toUpdate.find((u) => u.id === item.id);
      return update ? { ...item, amount: update.newAmount } : item;
    });
}
