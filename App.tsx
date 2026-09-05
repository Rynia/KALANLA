import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  TabType,
  FoodItem,
  RescueRecipe,
  ThermalReceiptData,
  AchievementBadge,
} from './src/types/models';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_RECIPES,
  INITIAL_BADGES,
} from './src/data/initialData';
import {
  loadKitchenState,
  saveKitchenState,
} from './src/storage/kitchenStorage';
import { scoreRecipes, buildConsumptionPlan, applyConsumptionPlan } from './src/utils/recipeEngine';
import { resolveFoodImage } from './src/utils/foodImageResolver';
import { rehydrateItems } from './src/utils/timeUtils';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { InventoryRadar } from './src/components/InventoryRadar';
import { RescueKitchen } from './src/components/RescueKitchen';
import { EarningsTelemetry } from './src/components/EarningsTelemetry';
import { QuickAddModal } from './src/components/QuickAddModal';
import { ThermalReceiptModal } from './src/components/ThermalReceiptModal';
import { RecipeDetailModal } from './src/components/RecipeDetailModal';
import { VisionScanModal } from './src/components/VisionScanModal';
import { ReceiptScanModal } from './src/components/ReceiptScanModal';
import { StudentVerifyModal } from './src/components/StudentVerifyModal';
import { PackagesModal } from './src/components/PackagesModal';
import { UserSubscription } from './src/types/subscription';
import { loadSubscription, INITIAL_SUBSCRIPTION } from './src/services/entitlements';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('gor');
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  // Dinamik tarif listesi — foodItems her değiştiğinde yeniden skorlanır
  const recipes = useMemo(
    () => scoreRecipes(foodItems, INITIAL_RECIPES),
    [foodItems],
  );
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);

  // Rescued metrics — yeni kurulum için 0'dan başlar, AsyncStorage'dan yüklenir
  const [rescuedTotalTL, setRescuedTotalTL] = useState<number>(0);
  const [rescuedCo2Kg, setRescuedCo2Kg] = useState<number>(0);
  const [rescuedMealsCount, setRescuedMealsCount] = useState<number>(0);

  // Fix 2: Hydration flag — kullanıcı işlemleri yükleme tamamlanana kadar persist edilmez
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<ThermalReceiptData | null>(null);
  const [activeDetailRecipe, setActiveDetailRecipe] = useState<RescueRecipe | null>(null);

  // Subscription / Paket Yönetimi
  const [subscription, setSubscription] = useState<UserSubscription>(INITIAL_SUBSCRIPTION);

  const urgentCount = useMemo(
    () => foodItems.filter((i) => i.hoursLeft <= 48).length,
    [foodItems],
  );

  // Fix 2: Hydration — iptal edilebilir async, race condition önlenir
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const persisted = await loadKitchenState();
      if (cancelled) return;
      if (persisted) {
        // Fix 1: Array.isArray ile boş liste de doğru şekilde yüklenir
        if (Array.isArray(persisted.foodItems)) {
          // Fix 3: Yüklenen ürünlerin hoursLeft'i gerçek zamana göre güncellenir
          setFoodItems(rehydrateItems(persisted.foodItems));
        }
        if (typeof persisted.rescuedTotalTL === 'number') {
          setRescuedTotalTL(persisted.rescuedTotalTL);
        }
        if (typeof persisted.rescuedCo2Kg === 'number') {
          setRescuedCo2Kg(persisted.rescuedCo2Kg);
        }
        if (typeof persisted.rescuedMealsCount === 'number') {
          setRescuedMealsCount(persisted.rescuedMealsCount);
        }
        if (Array.isArray(persisted.badges)) {
          setBadges(persisted.badges);
        }
      }
      const loadedSub = await loadSubscription();
      if (!cancelled) {
        setSubscription(loadedSub);
      }
      setIsHydrated(true);
    }
    hydrate();
    return () => { cancelled = true; };
  }, []);

  // Fix 7: Debounced persist — state değiştiğinde 500ms sonra tek yazma işlemi
  // Fire-and-forget çağrıların race condition'ını önler
  useEffect(() => {
    if (!isHydrated) return; // Hydration tamamlanmadan yazmaz
    const timeout = setTimeout(() => {
      saveKitchenState({
        foodItems,
        rescuedTotalTL,
        rescuedCo2Kg,
        rescuedMealsCount,
        badges,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [foodItems, rescuedTotalTL, rescuedCo2Kg, rescuedMealsCount, badges, isHydrated]);

  // Handle Tab Switch (if center 'ekle' is clicked, open modal directly)
  const handleTabChange = (tab: TabType) => {
    if ((tab as any) === 'ekle') {
      setIsAddModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Add Item to Inventory
  const handleAddItem = (newItem: Omit<FoodItem, 'id' | 'addedAt'>) => {
    const now = Date.now();
    const itemWithId: FoodItem = {
      ...newItem,
      id: `item-${now}`,
      addedAt: 'Şimdi',
      // Fix 3: Zaman damgası ile dinamik hoursLeft hesabı için
      addedTimestamp: now,
      estimatedShelfLifeHours: newItem.hoursLeft,
      // Ürün adından akıllı görsel çözümle
      imageUrl: newItem.imageUrl || resolveFoodImage(newItem.name, newItem.category),
    };
    setFoodItems((prev) => [itemWithId, ...prev]);
    // Debounced useEffect persist eder — manuel çağrıya gerek yok
  };

  // Add Batch Items from AI Vision Scanner
  const handleAddBatchItems = (newItems: Omit<FoodItem, 'id' | 'addedAt'>[]) => {
    const now = Date.now();
    const batchWithIds: FoodItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `item-vision-${now}-${idx}`,
      addedAt: 'Kamera',
      addedTimestamp: now,
      estimatedShelfLifeHours: item.hoursLeft,
      imageUrl: item.imageUrl || resolveFoodImage(item.name, item.category),
    }));
    setFoodItems((prev) => [...batchWithIds, ...prev]);
  };

  // Delete item from Inventory
  const handleDeleteItem = (id: string) => {
    setFoodItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Cooking Recipe Interaction: Kısmi tüketim planı ile malzemeleri azalt/sil
  const handleCookRecipe = (recipe: RescueRecipe) => {
    // 1. Tüketim planı oluştur (kısmi tüketim desteği)
    const plan = buildConsumptionPlan(recipe, foodItems);
    const nextItems = applyConsumptionPlan(foodItems, plan);

    // 2. Fiş için tüketilen malzemeleri topla
    const consumedItems: FoodItem[] = [
      ...foodItems.filter((item) => plan.toRemove.includes(item.id)),
      ...foodItems
        .filter((item) => plan.toUpdate.some((u) => u.id === item.id))
        .map((item) => {
          const upd = plan.toUpdate.find((u) => u.id === item.id)!;
          const consumedNum = parseFloat(item.amount) - parseFloat(upd.newAmount);
          const unitMatch = item.amount.match(/[^\d.]+/);
          const unit = unitMatch ? unitMatch[0].trim() : '';
          return { ...item, amount: `${isNaN(consumedNum) ? '' : consumedNum}${unit}` };
        }),
    ];

    const nextTotal = rescuedTotalTL + recipe.savedTL;
    const nextCo2 = Number((rescuedCo2Kg + recipe.co2SavedKg).toFixed(2));
    const nextMeals = rescuedMealsCount + 1;

    setFoodItems(nextItems);
    setRescuedTotalTL(nextTotal);
    setRescuedCo2Kg(nextCo2);
    setRescuedMealsCount(nextMeals);

    // 3. Termal fiş oluştur
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const receiptItems =
      consumedItems.length > 0
        ? consumedItems.map((item) => ({
            name: item.name,
            amount: item.amount,
            priceTL: item.priceTL,
          }))
        : [
            { name: 'Bayat Ekmek', amount: '250g', priceTL: 25 },
            { name: 'Kaşar Peyniri', amount: '200g', priceTL: 120 },
            { name: 'Salkım Domates', amount: '3 Adet', priceTL: 60 },
          ];

    const newReceipt: ThermalReceiptData = {
      id: `rcp-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      txCode: `TR-IST-034 // #${Math.floor(1000 + Math.random() * 9000)}`,
      recipeTitle: recipe.title,
      items: receiptItems,
      totalSavedTL: recipe.savedTL,
      co2SavedKg: recipe.co2SavedKg,
      durationMinutes: recipe.durationMinutes,
      barcodeNumber: '8 690123 456789',
    };

    setActiveReceipt(newReceipt);

    // 4. Başarımları güncelle
    const nextBadges = badges.map((badge) => {
      if (badge.id === 'badge-3') {
        return { ...badge, unlocked: true, progress: '4/5 İLERLEME' };
      }
      return badge;
    });
    setBadges(nextBadges);
    // Debounced useEffect persist eder

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
  };

  // Open historical receipt preview from Earnings tab
  const handleOpenReceiptFromEarnings = () => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;

    setActiveReceipt({
      id: 'rcp-historical',
      date: formattedDate,
      time: formattedTime,
      txCode: 'TR-IST-034 // #8821',
      recipeTitle: 'TAVADA ÇITIR KAŞARLI EKMEK',
      items: [
        { name: 'Bayat Ekmek', amount: '250g', priceTL: 25 },
        { name: 'Kaşar Peyniri', amount: '200g', priceTL: 120 },
        { name: 'Salkım Domates', amount: '3 Adet', priceTL: 60 },
      ],
      totalSavedTL: 205,
      co2SavedKg: 1.24,
      durationMinutes: 9,
      barcodeNumber: '8 690123 456789',
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0E" />

      {/* FIXED RYNIA OS TOP HEADER */}
      <Header activeTab={activeTab} urgentCount={urgentCount} />

      {/* SCROLLABLE VIEWPORT */}
      <ScrollView
        style={styles.viewport}
        contentContainerStyle={styles.viewportContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'gor' && (
          <InventoryRadar
            items={foodItems}
            rescuedTotalTL={rescuedTotalTL}
            rescuedCo2Kg={rescuedCo2Kg}
            onDeleteItem={handleDeleteItem}
            onNavigateToCook={() => setActiveTab('pisir')}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'pisir' && (
          <RescueKitchen
            recipes={recipes}
            inventory={foodItems}
            onCookRecipe={handleCookRecipe}
            onViewRecipeDetail={(recipe) => setActiveDetailRecipe(recipe)}
          />
        )}

        {activeTab === 'kazancin' && (
          <EarningsTelemetry
            rescuedTotalTL={rescuedTotalTL}
            rescuedCo2Kg={rescuedCo2Kg}
            rescuedMealsCount={rescuedMealsCount}
            badges={badges}
            onOpenReceipt={handleOpenReceiptFromEarnings}
          />
        )}
      </ScrollView>

      {/* FIXED BOTTOM TAB NAVIGATION */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        urgentCount={urgentCount}
        onOpenPackages={() => setIsPackagesModalOpen(true)}
      />

      {/* PACKAGES / ABONELİK KARŞILAŞTIRMA MODALI */}
      <PackagesModal
        isOpen={isPackagesModalOpen}
        onClose={() => setIsPackagesModalOpen(false)}
        subscription={subscription}
        onOpenStudentVerify={() => {
          setIsPackagesModalOpen(false);
          setIsStudentModalOpen(true);
        }}
      />

      {/* QUICK ADD INGREDIENT BOTTOM SHEET */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        onOpenVisionScan={() => setIsVisionModalOpen(true)}
        onOpenReceiptScan={() => setIsReceiptModalOpen(true)}
      />

      {/* MARKET RECEIPT OCR SCAN MODAL */}
      <ReceiptScanModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onAddBatchItems={handleAddBatchItems}
      />

      {/* AI VISION CAMERA SCAN MODAL */}
      <VisionScanModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        onAddBatchItems={handleAddBatchItems}
        subscription={subscription}
        onSubscriptionUpdate={setSubscription}
        onOpenStudentVerify={() => {
          setIsVisionModalOpen(false);
          setIsStudentModalOpen(true);
        }}
      />

      {/* UNIVERSITY STUDENT VERIFICATION MODAL (.edu.tr) */}
      <StudentVerifyModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onVerified={(updatedSub) => {
          setSubscription(updatedSub);
        }}
      />

      {/* RECIPE DETAIL / STEP-BY-STEP MODAL */}
      <RecipeDetailModal
        recipe={activeDetailRecipe}
        onClose={() => setActiveDetailRecipe(null)}
        onCookRecipe={handleCookRecipe}
      />

      {/* PHOTOREALISTIC THERMAL RECEIPT MODAL */}
      <ThermalReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  viewport: {
    flex: 1,
  },
  viewportContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
