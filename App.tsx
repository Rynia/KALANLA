import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  TabType,
  FoodItem,
  RescueRecipe,
  ThermalReceiptData,
  AchievementBadge,
  InventoryTransaction,
} from './src/types/models';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_RECIPES,
  INITIAL_BADGES,
} from './src/data/initialData';
import {
  loadKitchenState,
  saveKitchenState,
  clearKitchenState,
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
import { UndoToast } from './src/components/UndoToast';
import { LegalFooter } from './src/components/LegalFooter';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';
import { UserSubscription } from './src/types/subscription';
import { loadSubscription, saveSubscription, clearSubscription, INITIAL_SUBSCRIPTION } from './src/services/entitlements';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('gor');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
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

  // Hydration status — 'loading' | 'loaded' | 'error'
  // error durumunda disk asla ezilmez
  const [hydrationStatus, setHydrationStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Synchronous lock for cooking transactions (P0 double-tap guard)
  const cookingLock = useRef<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<ThermalReceiptData | null>(null);
  const [activeDetailRecipe, setActiveDetailRecipe] = useState<RescueRecipe | null>(null);

  // ChatGPT & Gemini Kuralı: Idempotent Transaction Undo State
  const [lastTransaction, setLastTransaction] = useState<InventoryTransaction | null>(null);
  const [isUndoVisible, setIsUndoVisible] = useState<boolean>(false);

  // Subscription / Paket Yönetimi
  const [subscription, setSubscription] = useState<UserSubscription>(INITIAL_SUBSCRIPTION);

  const urgentCount = useMemo(
    () => foodItems.filter((i) => i.hoursLeft <= 48).length,
    [foodItems],
  );

  // Hydration — iptal edilebilir async, race condition önlenir
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const result = await loadKitchenState();
      if (cancelled) return;

      if (result.status === 'loaded') {
        const persisted = result.state;
        if (Array.isArray(persisted.foodItems)) {
          setFoodItems(persisted.foodItems);
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
        setHydrationStatus('loaded');
      } else if (result.status === 'empty') {
        // İlk kurulum: Demo ürünlerle başlat
        setFoodItems(INITIAL_FOOD_ITEMS);
        setHydrationStatus('loaded');
      } else {
        // Okuma hatası: Asla diski demo veriyle ezme!
        console.warn('[KALANLA] Storage read failed. Holding save engine.');
        setHydrationStatus('error');
      }

      const loadedSub = await loadSubscription();
      if (!cancelled) {
        setSubscription(loadedSub);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced persist — state değiştiğinde 500ms sonra tek yazma işlemi
  // HydrationStatus 'loaded' değilse (örn. 'error' veya 'loading') asla diske yazmaz
  useEffect(() => {
    if (hydrationStatus !== 'loaded') return;
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
  }, [foodItems, rescuedTotalTL, rescuedCo2Kg, rescuedMealsCount, badges, hydrationStatus]);

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
    // Edge Case Koruma: Tarifteki zorunlu (kiler dışı) eksik malzemeleri tespit et
    const missingNonPantry = recipe.requiredItemNames.filter(
      (req) => !req.isPantry && !foodItems.some((item) => item.name.toLocaleLowerCase('tr-TR').includes(req.name.toLocaleLowerCase('tr-TR')))
    );

    if (missingNonPantry.length > 0) {
      const missingNames = missingNonPantry.map((m) => m.name).join(', ');
      Alert.alert(
        'Eksik Malzeme Var',
        `Bu tarif için dolabınızda "${missingNames}" bulunamadı. Yine de elinizdeki mevcut malzemeler dolaptan düşülsün mü?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Devam Et',
            onPress: () => executeCookingTransaction(recipe),
          },
        ]
      );
      return;
    }

    executeCookingTransaction(recipe);
  };

  const executeCookingTransaction = (recipe: RescueRecipe) => {
    // P0 Guard: Synchronous transaction lock (double-tap önleyici)
    if (cookingLock.current) return;
    cookingLock.current = true;

    try {
      // 1. Tüketim planı oluştur (kısmi tüketim desteği)
      const plan = buildConsumptionPlan(recipe, foodItems);

      // P0 Guard: Eğer dolaptan hiçbir ürün düşülmüyorsa (0 tüketim) asla sahte tasarruf/fiş üretme!
      if (plan.toRemove.length === 0 && plan.toUpdate.length === 0) {
        Alert.alert(
          'Yetersiz Malzeme',
          'Kilerinizde bu tarif için tüketilecek malzeme bulunamadı. Lütfen önce dolabınıza malzeme ekleyin.',
          [{ text: 'Tamam' }]
        );
        return;
      }

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

      // 2.5 Idempotent Transaction Snapshot Kaydı
      const transactionConsumed = [
        ...foodItems
          .filter((item) => plan.toRemove.includes(item.id))
          .map((item) => ({
            itemId: item.id,
            itemSnapshot: { ...item }, // Orijinal ID, imageUrl ve meta verisini korur
            wasCompletelyRemoved: true,
            previousAmount: item.amount,
          })),
        ...foodItems
          .filter((item) => plan.toUpdate.some((u) => u.id === item.id))
          .map((item) => ({
            itemId: item.id,
            itemSnapshot: { ...item },
            wasCompletelyRemoved: false,
            previousAmount: item.amount,
          })),
      ];

      const tx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        type: 'recipe-consume',
        status: 'committed',
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        consumedItems: transactionConsumed,
        savedTL: recipe.savedTL,
        co2SavedKg: recipe.co2SavedKg,
        createdAt: Date.now(),
      };

      setLastTransaction(tx);
      setIsUndoVisible(true);

      const nextTotal = rescuedTotalTL + recipe.savedTL;
      const nextCo2 = Number((rescuedCo2Kg + recipe.co2SavedKg).toFixed(2));
      const nextMeals = rescuedMealsCount + 1;

      setFoodItems(nextItems);
      setRescuedTotalTL(nextTotal);
      setRescuedCo2Kg(nextCo2);
      setRescuedMealsCount(nextMeals);

      // 3. Termal fiş oluştur (Yalnızca gerçekten tüketilen kalemlerle)
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(
        now.getMonth() + 1,
      ).padStart(2, '0')}.${now.getFullYear()}`;
      const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const receiptItems = consumedItems.map((item) => ({
        name: item.name,
        amount: item.amount,
        priceTL: item.priceTL,
      }));

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

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
      }
    } finally {
      // Transaction kilidini 400ms sonra kaldır (animasyon ve re-render güvenliği)
      setTimeout(() => {
        cookingLock.current = false;
      }, 400);
    }
  };

  // ChatGPT & Gemini Kuralı: Idempotent Undo Transaction Handler
  const handleUndoCook = () => {
    if (!lastTransaction || lastTransaction.status !== 'committed') return;

    // Yalnızca bu transaction'ın tükettiği kalemleri geri yükle
    setFoodItems((prevItems) => {
      let restored = [...prevItems];

      lastTransaction.consumedItems.forEach((ci) => {
        if (ci.wasCompletelyRemoved) {
          // Orijinal snapshottan geri koy
          restored = [ci.itemSnapshot, ...restored];
        } else {
          // Güncellenen ürünün miktarını eski haline getir; eğer kullanıcı ürünü silmişse snapshot ile dirilt
          const exists = restored.some((item) => item.id === ci.itemId);
          if (exists) {
            restored = restored.map((item) =>
              item.id === ci.itemId ? { ...item, amount: ci.previousAmount } : item
            );
          } else {
            restored = [{ ...ci.itemSnapshot, amount: ci.previousAmount }, ...restored];
          }
        }
      });

      return restored;
    });

    // Telemetriyi ve birikimleri tersine çevir
    setRescuedTotalTL((prev) => Math.max(0, prev - lastTransaction.savedTL));
    setRescuedCo2Kg((prev) => Math.max(0, Number((prev - lastTransaction.co2SavedKg).toFixed(2))));
    setRescuedMealsCount((prev) => Math.max(0, prev - 1));

    // Idempotency: İşlem durumunu reversed olarak işaretle, tekrar çalışmasını engelle
    setLastTransaction((prev) => (prev ? { ...prev, status: 'reversed' } : null));
    setIsUndoVisible(false);
    setActiveReceipt(null);
  };

  // Local-First / Guest Data Reset (Diski ve state'leri fiziksel olarak siler)
  const handleResetAllData = async () => {
    Alert.alert(
      'Tüm Verileri Sıfırla',
      'Kilerinizdeki tüm malzemeler, tasarruf geçmişiniz ve fişleriniz kalıcı olarak silinecektir. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla ve Temizle',
          style: 'destructive',
          onPress: async () => {
            setFoodItems([]);
            setRescuedTotalTL(0);
            setRescuedCo2Kg(0);
            setRescuedMealsCount(0);
            setBadges(INITIAL_BADGES);
            setSubscription(INITIAL_SUBSCRIPTION);
            setActiveReceipt(null);
            setActiveDetailRecipe(null);
            setLastTransaction(null);
            setIsUndoVisible(false);

            // Kalıcı depolamayı diskten fiziksel olarak sil
            await clearKitchenState();
            await clearSubscription();

            Alert.alert('Temizlendi', 'Kileriniz ve tüm yerel verileriniz başarıyla sıfırlandı.');
          },
        },
      ]
    );
  };

  // Memoized undo toast dismiss
  const handleUndoDismiss = useCallback(() => {
    setIsUndoVisible(false);
  }, []);

  // Open historical receipt preview from Earnings tab
  const handleOpenReceiptFromEarnings = () => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;

    if (lastTransaction && lastTransaction.status === 'committed' && lastTransaction.consumedItems.length > 0) {
      setActiveReceipt({
        id: `rcp-${lastTransaction.id}`,
        date: formattedDate,
        time: formattedTime,
        txCode: `TR-IST-034 // #${Math.floor(1000 + Math.random() * 9000)}`,
        recipeTitle: lastTransaction.recipeTitle,
        items: lastTransaction.consumedItems.map((ci) => ({
          name: ci.itemSnapshot.name,
          amount: ci.itemSnapshot.amount,
          priceTL: ci.itemSnapshot.priceTL,
        })),
        totalSavedTL: lastTransaction.savedTL,
        co2SavedKg: lastTransaction.co2SavedKg,
        durationMinutes: 10,
        barcodeNumber: '8 690123 456789',
      });
      return;
    }

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#141210" />

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
            onPopulateDemoItems={() => {
              setFoodItems(INITIAL_FOOD_ITEMS);
              if (Platform.OS !== 'web') {
                try {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (e) {}
              }
            }}
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

        {/* Food Safety Notice & Local Data Reset */}
        <LegalFooter onResetData={handleResetAllData} />
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
        onOpenQuickAdd={() => setIsAddModalOpen(true)}
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
        onOpenQuickAdd={() => setIsAddModalOpen(true)}
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

      {/* DYNAMIC 5-SECOND TRANSACTIONAL UNDO TOAST */}
      <UndoToast
        isVisible={isUndoVisible}
        recipeTitle={lastTransaction?.recipeTitle || ''}
        onUndo={handleUndoCook}
        onDismiss={handleUndoDismiss}
      />

      {/* CINEMATIC WARM TECH ANIMATED SPLASH SCREEN */}
      {showSplash && (
        <AnimatedSplashScreen
          onAnimationFinish={() => setShowSplash(false)}
        />
      )}
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#141210',
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
