import React, { useState, useEffect } from 'react';
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
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { InventoryRadar } from './src/components/InventoryRadar';
import { RescueKitchen } from './src/components/RescueKitchen';
import { EarningsTelemetry } from './src/components/EarningsTelemetry';
import { QuickAddModal } from './src/components/QuickAddModal';
import { ThermalReceiptModal } from './src/components/ThermalReceiptModal';
import { RecipeDetailModal } from './src/components/RecipeDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('gor');
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [recipes] = useState<RescueRecipe[]>(INITIAL_RECIPES);
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);

  // Rescued metrics
  const [rescuedTotalTL, setRescuedTotalTL] = useState<number>(1120);
  const [rescuedCo2Kg, setRescuedCo2Kg] = useState<number>(2.4);
  const [rescuedMealsCount, setRescuedMealsCount] = useState<number>(12);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<ThermalReceiptData | null>(null);
  const [activeDetailRecipe, setActiveDetailRecipe] = useState<RescueRecipe | null>(null);

  const urgentCount = foodItems.filter((i) => i.hoursLeft <= 48).length;

  // Load state on mount
  useEffect(() => {
    async function hydrate() {
      const persisted = await loadKitchenState();
      if (persisted) {
        if (persisted.foodItems && persisted.foodItems.length > 0) {
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
        if (persisted.badges) {
          setBadges(persisted.badges);
        }
      }
    }
    hydrate();
  }, []);

  // Save state helper
  const persistState = (
    nextItems: FoodItem[],
    nextTotal: number,
    nextCo2: number,
    nextMeals: number,
    nextBadges: AchievementBadge[],
  ) => {
    saveKitchenState({
      foodItems: nextItems,
      rescuedTotalTL: nextTotal,
      rescuedCo2Kg: nextCo2,
      rescuedMealsCount: nextMeals,
      badges: nextBadges,
    });
  };

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
    const itemWithId: FoodItem = {
      ...newItem,
      id: `item-${Date.now()}`,
      addedAt: 'Şimdi',
    };
    const nextList = [itemWithId, ...foodItems];
    setFoodItems(nextList);
    persistState(nextList, rescuedTotalTL, rescuedCo2Kg, rescuedMealsCount, badges);
  };

  // Delete item from Inventory
  const handleDeleteItem = (id: string) => {
    const nextList = foodItems.filter((i) => i.id !== id);
    setFoodItems(nextList);
    persistState(nextList, rescuedTotalTL, rescuedCo2Kg, rescuedMealsCount, badges);
  };

  // Cooking Recipe Interaction: Deducts items, increases savings, creates thermal receipt
  const handleCookRecipe = (recipe: RescueRecipe) => {
    const matchedItemsToRemove: FoodItem[] = [];
    recipe.requiredItemNames.forEach((req) => {
      if (!req.isPantry) {
        const found = foodItems.find(
          (item) =>
            item.name.toLocaleLowerCase('tr-TR').includes(req.name.toLocaleLowerCase('tr-TR')) ||
            req.name.toLocaleLowerCase('tr-TR').includes(item.name.toLocaleLowerCase('tr-TR')),
        );
        if (found && !matchedItemsToRemove.some((m) => m.id === found.id)) {
          matchedItemsToRemove.push(found);
        }
      }
    });

    const nextItems = foodItems.filter(
      (item) => !matchedItemsToRemove.some((m) => m.id === item.id),
    );
    const nextTotal = rescuedTotalTL + recipe.savedTL;
    const nextCo2 = Number((rescuedCo2Kg + recipe.co2SavedKg).toFixed(2));
    const nextMeals = rescuedMealsCount + 1;

    setFoodItems(nextItems);
    setRescuedTotalTL(nextTotal);
    setRescuedCo2Kg(nextCo2);
    setRescuedMealsCount(nextMeals);

    // Build authentic thermal receipt data matching reference
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}.${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const receiptItems = matchedItemsToRemove.map((item) => ({
      name: item.name,
      amount: item.amount,
      priceTL: item.priceTL,
    }));

    if (receiptItems.length === 0) {
      receiptItems.push(
        { name: 'Bayat Ekmek', amount: '250g', priceTL: 25 },
        { name: 'Kaşar Peyniri', amount: '200g', priceTL: 120 },
        { name: 'Salkım Domates', amount: '3 Adet', priceTL: 60 },
      );
    }

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

    // Unlock achievements
    const nextBadges = badges.map((badge) => {
      if (badge.id === 'badge-3') {
        return {
          ...badge,
          unlocked: true,
          progress: '4/5 İLERLEME',
        };
      }
      return badge;
    });
    setBadges(nextBadges);

    persistState(nextItems, nextTotal, nextCo2, nextMeals, nextBadges);

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
      />

      {/* QUICK ADD INGREDIENT BOTTOM SHEET */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
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
