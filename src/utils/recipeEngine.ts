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

function isMatch(itemName: string, requiredName: string): boolean {
  const normItem = normalize(itemName);
  const normReq = normalize(requiredName);
  return normItem.includes(normReq) || normReq.includes(normItem);
}

function findMatch(required: string, inventory: FoodItem[]): FoodItem | undefined {
  return inventory.find((item) => isMatch(item.name, required));
}

/**
 * Ana sıralama fonksiyonu.
 * Pantry içeriğine göre her tarifi dinamik olarak skorlar ve sıralar.
 * Sıralama: matchPercentage DESC → urgencyScore DESC → savedTL DESC
 */
export function scoreRecipes(inventory: FoodItem[], recipes: RescueRecipe[]): RescueRecipe[] {
  const scored = recipes.map((recipe) => {
    const nonPantryItems = recipe.requiredItemNames.filter((r) => !r.isPantry);
    const totalRequired = nonPantryItems.length;

    const matchedItems: FoodItem[] = [];
    const missingNames: string[] = [];

    nonPantryItems.forEach((req) => {
      const match = findMatch(req.name, inventory);
      if (match && !matchedItems.some((m) => m.id === match.id)) {
        matchedItems.push(match);
      } else if (!match) {
        missingNames.push(req.name);
      }
    });

    const matchCount = matchedItems.length;
    const matchPercentage =
      totalRequired === 0 ? 100 : Math.round((matchCount / totalRequired) * 100);

    const urgencyScore =
      matchedItems.length > 0
        ? Math.round(
            matchedItems.reduce((sum, item) => sum + item.riskPercentage, 0) /
              matchedItems.length,
          )
        : 0;

    const updatedRequiredItems = recipe.requiredItemNames.map((req) => ({
      ...req,
      rescued: req.isPantry ? false : !!findMatch(req.name, inventory),
    }));

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

export function buildConsumptionPlan(
  recipe: RescueRecipe,
  inventory: FoodItem[],
): ConsumptionPlan {
  const toRemove: string[] = [];
  const toUpdate: { id: string; newAmount: string }[] = [];

  recipe.requiredItemNames.forEach((req) => {
    if (req.isPantry) return;
    const found = findMatch(req.name, inventory);
    if (!found) return;

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
      toUpdate.push({ id: found.id, newAmount: `${remaining}${unit}` });
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
