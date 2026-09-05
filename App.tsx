import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  Ingredient,
  Recipe,
  Tab,
} from './src/types/models';
import { colors, spacing, radius } from './src/theme/theme';
import { initialIngredients, initialRecipes } from './src/data/initialData';
import {
  loadKitchenState,
  saveKitchenState,
} from './src/storage/kitchenStorage';
import {
  Header,
  StatsRadar,
  IngredientCard,
  RecipeCard,
} from './src/components/KitchenComponents';
import { AddIngredientModal } from './src/components/AddIngredientModal';
import { ThermalReceiptModal } from './src/components/ThermalReceiptModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('see');
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [recipes] = useState<Recipe[]>(initialRecipes);
  const [savedValue, setSavedValue] = useState(860);
  const [completedRecipes, setCompletedRecipes] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [receiptRecipe, setReceiptRecipe] = useState<Recipe | null>(null);
  const [lastSavedAmount, setLastSavedAmount] = useState(0);

  // Load persisted state on mount
  useEffect(() => {
    async function hydrate() {
      const persisted = await loadKitchenState();
      if (persisted) {
        if (persisted.ingredients) {
          setIngredients(persisted.ingredients);
        }
        if (typeof persisted.savedValue === 'number') {
          setSavedValue(persisted.savedValue);
        }
        if (typeof persisted.completedRecipes === 'number') {
          setCompletedRecipes(persisted.completedRecipes);
        }
      }
    }
    hydrate();
  }, []);

  // Save state when core values change
  const persistCurrentState = (
    nextIngredients: Ingredient[],
    nextSaved: number,
    nextCompleted: number,
  ) => {
    saveKitchenState({
      ingredients: nextIngredients,
      savedValue: nextSaved,
      completedRecipes: nextCompleted,
    });
  };

  // Derived Kitchen Statistics
  const stats = useMemo(() => {
    const totalValue = ingredients.reduce((sum, item) => sum + item.value, 0);
    const atRiskValue = ingredients
      .filter((item) => item.daysLeft <= 2)
      .reduce((sum, item) => sum + item.value, 0);
    return {
      totalValue,
      atRiskValue,
      savedValue,
    };
  }, [ingredients, savedValue]);

  // Urgency sorted ingredients
  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) => a.daysLeft - b.daysLeft);
  }, [ingredients]);

  // Haptic feedback helpers
  const triggerLightHaptic = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const triggerSuccessHaptic = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
  };

  // Tab change handler
  const handleTabChange = (tab: Tab) => {
    triggerLightHaptic();
    setActiveTab(tab);
  };

  // Add new ingredient
  const handleAddIngredient = (newIngredient: Ingredient) => {
    const nextList = [newIngredient, ...ingredients];
    setIngredients(nextList);
    persistCurrentState(nextList, savedValue, completedRecipes);
    triggerSuccessHaptic();
  };

  // Cook / rescue action with inventory deduction logic
  const handleCookRecipe = (recipe: Recipe) => {
    // 1. Identify used ingredients and deduct them from pantry
    const usedNames = recipe.ingredientsUsed.map((u) => u.toLocaleLowerCase('tr-TR'));
    
    // Find matching ingredients to compute accurate rescued value
    const matched = ingredients.filter((ing) =>
      usedNames.some((u) => ing.name.toLocaleLowerCase('tr-TR').includes(u) || u.includes(ing.name.toLocaleLowerCase('tr-TR')))
    );

    const computedSavings = matched.length > 0
      ? matched.reduce((sum, m) => sum + m.value, 0)
      : recipe.savings;

    // Remaining ingredients after cooking
    const remaining = ingredients.filter(
      (ing) => !matched.some((m) => m.id === ing.id)
    );

    const nextSaved = savedValue + computedSavings;
    const nextCompleted = completedRecipes + 1;

    setIngredients(remaining);
    setLastSavedAmount(computedSavings);
    setReceiptRecipe(recipe);
    setSavedValue(nextSaved);
    setCompletedRecipes(nextCompleted);
    persistCurrentState(remaining, nextSaved, nextCompleted);

    triggerSuccessHaptic();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* TOP BRAND HEADER */}
      <Header />

      {/* VALUE & SPOILAGE RADAR */}
      <StatsRadar
        totalValue={stats.totalValue}
        atRiskValue={stats.atRiskValue}
        savedValue={stats.savedValue}
      />

      {/* NAVIGATION TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'see' && styles.tabButtonActive]}
          onPress={() => handleTabChange('see')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'see' && styles.tabTextActive]}>
            GÖR // Kalanlar ({ingredients.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'cook' && styles.tabButtonActive]}
          onPress={() => handleTabChange('cook')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'cook' && styles.tabTextActive]}>
            PİŞİR // Kalanla Yap
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'savings' && styles.tabButtonActive]}
          onPress={() => handleTabChange('savings')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'savings' && styles.tabTextActive]}>
            KAZANCIN
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: GÖR (KALANLAR) */}
        {activeTab === 'see' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>BUZDOLABINDA NE VAR?</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  triggerLightHaptic();
                  setIsAddModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ Malzeme Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* EMPTY STATE */}
            {ingredients.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🥬</Text>
                <Text style={styles.emptyTitle}>Dolabın tamamen tertemiz!</Text>
                <Text style={styles.emptySubtitle}>
                  Bozulma riski taşıyan hiçbir malzeme yok. Yeni aldığın ürünleri ekleyerek israf radarını başlat.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => {
                    triggerLightHaptic();
                    setIsAddModalOpen(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyActionBtnText}>+ İlk Malzemeni Ekle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* SAFE STATE BANNER (When items exist but none are critical) */}
                {stats.atRiskValue === 0 && (
                  <View style={styles.safeBanner}>
                    <Text style={styles.safeBannerText}>
                      ✓ Şu an 48 saatlik risk altında malzeme yok. Mutfak kontrol altında!
                    </Text>
                  </View>
                )}

                {/* INGREDIENT LIST */}
                {sortedIngredients.map((item) => (
                  <IngredientCard key={item.id} item={item} />
                ))}

                {/* ACTION HERO BUTTON */}
                {stats.atRiskValue > 0 ? (
                  <TouchableOpacity
                    style={styles.actionHeroButton}
                    onPress={() => handleTabChange('cook')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionHeroText}>
                      ⚡ Riskteki ₺{stats.atRiskValue}'yi Kurtar →
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionHeroButton, { borderColor: colors.border }]}
                    onPress={() => handleTabChange('cook')}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.actionHeroText, { color: colors.text }]}>
                      🍳 Kalanlarla Akşam Yemeği Planla →
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* TAB 2: PİŞİR (KALANLA YAP) */}
        {activeTab === 'cook' && (
          <View>
            <Text style={styles.sectionTitle}>10-15 DAKİKALIK KURTARMA MENÜSÜ</Text>
            <Text style={styles.sectionSubtitle}>
              Dolabında bozulma riski olan malzemelerle anında pişirebileceğin sıfır-atık reçeteleri:
            </Text>

            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onCook={handleCookRecipe}
              />
            ))}
          </View>
        )}

        {/* TAB 3: KAZANCIN (TASARRUF RAPORU) */}
        {activeTab === 'savings' && (
          <View>
            <Text style={styles.sectionTitle}>AYLIK BEREKET & TASARRUF RAPORU</Text>

            <View style={styles.savingsHeroCard}>
              <Text style={styles.savingsBigLabel}>
                BU AY ÇÖPE GİTMEKTEN KURTARILAN TAHMİNİ DEĞER
              </Text>
              <Text style={styles.savingsBigValue}>₺{savedValue}</Text>
              <Text style={styles.savingsHeroSub}>
                Bu tutarla yaklaşık 3 market alışverişi veya 4 dışarı yemeği bedavaya geldi!
              </Text>

              <View style={styles.carbonBadgeRow}>
                <Text style={styles.carbonBadgeText}>
                  🌱 Engellenen Karbon Salınımı: ~{(savedValue * 0.045).toFixed(1)} kg CO₂e
                </Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{completedRecipes}</Text>
                <Text style={styles.metricCardLabel}>Kurtarılan Öğün</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{ingredients.length}</Text>
                <Text style={styles.metricCardLabel}>Aktif Malzeme</Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>🛡️</Text>
                <Text style={styles.badgeTitle}>Sıfır Ziyan</Text>
                <Text style={styles.badgeDesc}>4 gün ardışık kurtarma</Text>
              </View>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>👑</Text>
                <Text style={styles.badgeTitle}>Dolap Hakimi</Text>
                <Text style={styles.badgeDesc}>6 öğün evde pişirildi</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* AKILLI MALZEME EKLEME MODALI (AUTOCOMPLETE & QUICK ADD) */}
      <AddIngredientModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddIngredient={handleAddIngredient}
      />

      {/* TERMAL FİŞ & GÖRSEL PAYLAŞIM MODALI (VIEWSHOT + EXPO-SHARING) */}
      <ThermalReceiptModal
        visible={!!receiptRecipe}
        recipe={receiptRecipe}
        savedValue={lastSavedAmount}
        totalSavedMonth={savedValue}
        onClose={() => setReceiptRecipe(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surfaceRaised,
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    marginTop: spacing.md,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.emerald,
  },
  addButtonText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '800',
  },
  safeBanner: {
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emerald,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  safeBannerText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  emptyActionBtn: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  emptyActionBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '800',
  },
  actionHeroButton: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionHeroText: {
    color: colors.emerald,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  savingsHeroCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savingsBigLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  savingsBigValue: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.emerald,
    marginBottom: spacing.sm,
  },
  savingsHeroSub: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  carbonBadgeRow: {
    backgroundColor: colors.emeraldSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  carbonBadgeText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  metricCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  metricCardLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
});
