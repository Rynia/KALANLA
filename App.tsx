import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  Ingredient,
  Recipe,
  IngredientCategory,
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

const CATEGORIES: IngredientCategory[] = [
  'Süt Ürünleri',
  'Sebze',
  'Fırın',
  'Temel Gıda',
  'Meyve',
  'Et & Şarküteri',
  'Genel',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('see');
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [recipes] = useState<Recipe[]>(initialRecipes);
  const [savedValue, setSavedValue] = useState(860);
  const [completedRecipes, setCompletedRecipes] = useState(0);

  // New Ingredient Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<IngredientCategory>('Genel');
  const [newDays, setNewDays] = useState('3');
  const [newValue, setNewValue] = useState('50');

  // Thermal Receipt Modal State
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [lastRecipe, setLastRecipe] = useState<Recipe | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    async function hydrate() {
      const persisted = await loadKitchenState();
      if (persisted) {
        if (persisted.ingredients && persisted.ingredients.length > 0) {
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
  const handleAddIngredient = () => {
    if (!newName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen malzeme adını girin.');
      return;
    }

    const days = parseInt(newDays, 10) || 3;
    const val = parseInt(newValue, 10) || 40;

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      daysLeft: days,
      value: val,
      critical: days <= 2,
    };

    const nextList = [newItem, ...ingredients];
    setIngredients(nextList);
    persistCurrentState(nextList, savedValue, completedRecipes);
    triggerSuccessHaptic();

    // Reset form
    setNewName('');
    setNewCategory('Genel');
    setNewDays('3');
    setNewValue('50');
    setModalVisible(false);
  };

  // Cook / rescue action
  const handleCookRecipe = (recipe: Recipe) => {
    const nextSaved = savedValue + recipe.savings;
    const nextCompleted = completedRecipes + 1;

    setLastRecipe(recipe);
    setSavedValue(nextSaved);
    setCompletedRecipes(nextCompleted);
    persistCurrentState(ingredients, nextSaved, nextCompleted);

    triggerSuccessHaptic();
    setReceiptVisible(true);
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
                  setModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ Malzeme Ekle</Text>
              </TouchableOpacity>
            </View>

            {sortedIngredients.map((item) => (
              <IngredientCard key={item.id} item={item} />
            ))}

            <TouchableOpacity
              style={styles.actionHeroButton}
              onPress={() => handleTabChange('cook')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionHeroText}>
                ⚡ Riskteki ₺{stats.atRiskValue}'yi Kurtar →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: PİŞİR (KALANLA YAP) */}
        {activeTab === 'cook' && (
          <View>
            <Text style={styles.sectionTitle}>10-15 DAKİKALIK KURTARMA MENÜSÜ</Text>
            <Text style={styles.sectionSubtitle}>
              Dolabında bozulma riski olan malzemelerle anında pişirebileceğin şef yemekleri:
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

      {/* NEW INGREDIENT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Malzeme Ekle</Text>

            <Text style={styles.inputLabel}>Malzeme Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 2 Paket Mantar"
              placeholderTextColor={colors.muted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.inputLabel}>Kategori</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryPickerRow}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    newCategory === cat && styles.catChipActive,
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      newCategory === cat && styles.catChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Kaç Gün Kaldı?</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newDays}
                  onChangeText={setNewDays}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tahmini Değeri (TL)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newValue}
                  onChangeText={setNewValue}
                />
              </View>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleAddIngredient}
              >
                <Text style={[styles.modalBtnText, { color: colors.background, fontWeight: '800' }]}>
                  Ekle
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* THERMAL RECEIPT MODAL */}
      <Modal visible={receiptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.thermalReceipt}>
            <Text style={styles.thermalHeader}>*** KALANLA KURTARMA FİŞİ ***</Text>
            <Text style={styles.thermalSub}>RYNIA STUDIOS // ZERO WASTE ENGINE</Text>
            <View style={styles.thermalDivider} />

            <Text style={styles.thermalItemTitle}>{lastRecipe?.title}</Text>
            <Text style={styles.thermalDetail}>
              Süre: {lastRecipe?.timeMin} Dk · Dışarı Sipariş Engellendi
            </Text>

            <View style={styles.thermalDivider} />
            <Text style={styles.thermalSavingBig}>KURTARILAN: ₺{lastRecipe?.savings}</Text>
            <Text style={styles.thermalTotal}>TOPLAM BİRİKİM: ₺{savedValue}</Text>

            <View style={styles.thermalDivider} />
            <Text style={styles.thermalFooter}>"Ne kaldıysa, ondan başla."</Text>

            <TouchableOpacity
              style={styles.thermalCloseBtn}
              onPress={() => setReceiptVisible(false)}
            >
              <Text style={styles.thermalCloseText}>Kapat & Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  catChip: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.emerald,
  },
  catChipText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: colors.emerald,
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnSave: {
    backgroundColor: colors.emerald,
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  thermalReceipt: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.sm,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  thermalHeader: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    color: '#111827',
    marginBottom: 2,
  },
  thermalSub: {
    fontSize: 9,
    textAlign: 'center',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  thermalDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  thermalItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  thermalDetail: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
  },
  thermalSavingBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#047857',
    textAlign: 'center',
    marginVertical: 4,
  },
  thermalTotal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  thermalFooter: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: spacing.lg,
  },
  thermalCloseBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  thermalCloseText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '800',
  },
});
