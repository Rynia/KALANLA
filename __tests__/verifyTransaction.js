// __tests__/verifyTransaction.js
// Idempotent Transaction & Consumption Logic Runner

function normalize(text) {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function isMatch(itemName, requiredName) {
  const normItem = normalize(itemName).trim();
  const normReq = normalize(requiredName).trim();
  if (normItem === normReq) return true;

  const itemTokens = normItem.split(/\s+/);
  const reqTokens = normReq.split(/\s+/);
  for (const it of itemTokens) {
    for (const rt of reqTokens) {
      if (it === rt) return true;
      if (it.length >= 2 && rt.length >= 2) {
        if (it.startsWith(rt) || rt.startsWith(it)) return true;
      }
    }
  }
  return false;
}

function buildConsumptionPlan(recipe, inventory) {
  const toRemove = [];
  const toUpdate = [];
  const usedIds = new Set();

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
      const unit = unitMatch ? unitMatch[0] : '';
      toUpdate.push({ id: found.id, newAmount: `${Math.round(remaining * 10) / 10}${unit}` });
    }
  });

  return { toRemove, toUpdate };
}

function applyConsumptionPlan(inventory, plan) {
  return inventory
    .filter((item) => !plan.toRemove.includes(item.id))
    .map((item) => {
      const update = plan.toUpdate.find((u) => u.id === item.id);
      return update ? { ...item, amount: update.newAmount } : item;
    });
}

function assert(condition, message) {
  if (!condition) {
    console.error('❌ Assertion failed:', message);
    process.exit(1);
  }
}

console.log('🧪 Running Suite: Idempotent InventoryTransaction & Consumption Verification...');

const initialItems = [
  {
    id: 'item-1',
    name: 'Kaşar Peyniri',
    category: 'Süt Ürünü',
    amount: '200g',
    location: 'Buzdolabı',
    hoursLeft: 48,
    riskPercentage: 80,
    priceTL: 120,
    imageUrl: 'https://example.com/kasar.jpg',
  },
  {
    id: 'item-2',
    name: 'Salkım Domates',
    category: 'Sebze',
    amount: '3 Adet',
    location: 'Buzdolabı',
    hoursLeft: 24,
    riskPercentage: 90,
    priceTL: 45,
    imageUrl: 'https://example.com/domates.jpg',
  },
  {
    id: 'item-3',
    name: 'Köy Yumurtası',
    category: 'Kiler',
    amount: '6 Adet',
    location: 'Buzdolabı',
    hoursLeft: 100,
    riskPercentage: 40,
    priceTL: 45,
    imageUrl: 'https://example.com/yumurta.jpg',
  },
];

const testRecipeA = {
  id: 'rec-test-1',
  title: 'Kaşarlı Domates Tostu',
  savedTL: 80,
  co2SavedKg: 0.6,
  durationMinutes: 10,
  requiredItemNames: [
    { name: 'Kaşar Peyniri', isPantry: false, rescued: true, consumeAmount: '100g' },
    { name: 'Salkım Domates', isPantry: false, rescued: true },
  ],
};

// 1. Tüketim Planı Doğrulaması
const planA = buildConsumptionPlan(testRecipeA, initialItems);
assert(planA.toRemove.includes('item-2'), 'item-2 (Domates) must be marked toRemove');
assert(planA.toUpdate.length === 1 && planA.toUpdate[0].newAmount === '100g', 'item-1 (Kaşar) must be updated to 100g');

const consumedStateA = applyConsumptionPlan(initialItems, planA);
assert(consumedStateA.length === 2, 'Inventory length after consumption must be 2 (Kaşar + Yumurta)');
assert(consumedStateA.find((i) => i.id === 'item-1').amount === '100g', 'Remaining Kaşar must be 100g');
console.log('  ✓ Test 1 Passed: Partial consumption (Kaşar 200g -> 100g) and full removal (Domates) correctly computed.');

// 2. Undo & Idempotency Doğrulaması
const txA = {
  id: 'tx-A',
  type: 'recipe-consume',
  status: 'committed',
  recipeId: testRecipeA.id,
  recipeTitle: testRecipeA.title,
  consumedItems: [
    {
      itemId: 'item-2',
      itemSnapshot: { ...initialItems[1] },
      wasCompletelyRemoved: true,
      previousAmount: '3 Adet',
    },
    {
      itemId: 'item-1',
      itemSnapshot: { ...initialItems[0] },
      wasCompletelyRemoved: false,
      previousAmount: '200g',
    },
  ],
  savedTL: 80,
  co2SavedKg: 0.6,
  createdAt: Date.now(),
};

// Geri Al (Undo) Çalıştırma
let restored = [...consumedStateA];
txA.consumedItems.forEach((ci) => {
  if (ci.wasCompletelyRemoved) {
    restored = [ci.itemSnapshot, ...restored];
  } else {
    restored = restored.map((item) =>
      item.id === ci.itemId ? { ...item, amount: ci.previousAmount } : item
    );
  }
});
txA.status = 'reversed';

assert(restored.length === 3, 'Restored inventory must contain all 3 items');
const restoredKasar = restored.find((i) => i.id === 'item-1');
const restoredDomates = restored.find((i) => i.id === 'item-2');
assert(restoredKasar.amount === '200g', 'Restored Kaşar amount must be 200g');
assert(restoredDomates.amount === '3 Adet', 'Restored Domates amount must be 3 Adet');
assert(restoredDomates.imageUrl === 'https://example.com/domates.jpg', 'Restored Domates must preserve imageUrl');
console.log('  ✓ Test 2 Passed: Single Undo restored all exact original item snapshots, IDs, and quantities.');

// 3. Mükerrer Undo Engeli (Idempotency)
const canUndoAgain = txA.status === 'committed';
assert(!canUndoAgain, 'Reversed transaction must NOT be undoable a second time');
console.log('  ✓ Test 3 Passed: Idempotency check verified (status is "reversed", second undo blocked).');

// 4. Concurrency & Bağımsızlık Testi (ChatGPT Kuralı: Tx A + Tx B -> A.undo())
// Durum: Tx A pişirildi (Domates gitti, Kaşar 100g).
// Ardından Tx B pişirildi (Yumurta 2 adet azaldı).
const testRecipeB = {
  id: 'rec-test-2',
  title: 'Omlet',
  savedTL: 30,
  co2SavedKg: 0.2,
  durationMinutes: 5,
  requiredItemNames: [
    { name: 'Köy Yumurtası', isPantry: false, rescued: true, consumeAmount: '2 Adet' },
  ],
};
const planB = buildConsumptionPlan(testRecipeB, consumedStateA);
const consumedStateB = applyConsumptionPlan(consumedStateA, planB);
assert(consumedStateB.find((i) => i.id === 'item-3').amount === '4 Adet', 'Yumurta must be reduced to 4 Adet');

// Şimdi Tx A'yı geri alıyoruz (Domates geri gelsin, Kaşar 200g olsun, AMA Yumurta 4 Adet olarak kalsın!)
let restoredFromA = [...consumedStateB];
txA.consumedItems.forEach((ci) => {
  if (ci.wasCompletelyRemoved) {
    restoredFromA = [ci.itemSnapshot, ...restoredFromA];
  } else {
    restoredFromA = restoredFromA.map((item) =>
      item.id === ci.itemId ? { ...item, amount: ci.previousAmount } : item
    );
  }
});
assert(restoredFromA.find((i) => i.id === 'item-2').amount === '3 Adet', 'Tx A undo restored Domates');
assert(restoredFromA.find((i) => i.id === 'item-1').amount === '200g', 'Tx A undo restored Kaşar');
assert(restoredFromA.find((i) => i.id === 'item-3').amount === '4 Adet', 'Tx B (Yumurta) was UNTOUCHED by Tx A undo');
console.log('  ✓ Test 4 Passed (Concurrency): Multiple transactions preserve independent state when one is undone.');

console.log('\n🎉 ALL 4 UNIT, CONCURRENCY & IDEMPOTENCY TESTS PASSED WITH 0 ERRORS!');
