import React, { useState } from 'react';
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
  Alert
} from 'react-native';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  daysLeft: number;
  value: number;
  critical: boolean;
}

interface Recipe {
  id: string;
  title: string;
  timeMin: number;
  savings: number;
  ingredientsUsed: string[];
  description: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'see' | 'cook' | 'savings'>('see');
  
  // Envanter (Kalanlar)
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Yarım Kaşar Peyniri', category: 'Süt Ürünleri', daysLeft: 1, value: 140, critical: true },
    { id: '2', name: 'Bayat Ekmek (1 Adet)', category: 'Fırın', daysLeft: 1, value: 20, critical: true },
    { id: '3', name: 'Yumuşamış Domates (3 Adet)', category: 'Sebze', daysLeft: 2, value: 45, critical: true },
    { id: '4', name: 'Yarım Sıvı Krema', category: 'Süt Ürünleri', daysLeft: 2, value: 65, critical: true },
    { id: '5', name: 'Yumurta (4 Adet)', category: 'Temel Gıda', daysLeft: 6, value: 40, critical: false },
    { id: '6', name: 'Süzme Yoğurt', category: 'Süt Ürünleri', daysLeft: 5, value: 75, critical: false },
  ]);

  // Yeni malzeme ekleme modalı
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDays, setNewDays] = useState('3');
  const [newValue, setNewValue] = useState('50');

  // Termal Fiş Modalı
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [lastSavedRecipe, setLastSavedRecipe] = useState<Recipe | null>(null);

  // Toplam Değer Hesaplamaları
  const totalKitchenValue = ingredients.reduce((sum, item) => sum + item.value, 0);
  const totalAtRisk = ingredients.filter(i => i.daysLeft <= 2).reduce((sum, item) => sum + item.value, 0);
  const [totalSavedMonth, setTotalSavedMonth] = useState(860);

  // AI Reçeteleri (Kalanla Yap)
  const recipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Tavada Çıtır Kaşarlı Domatesli Ekmek',
      timeMin: 9,
      savings: 205,
      ingredientsUsed: ['Bayat Ekmek', 'Kaşar Peyniri', 'Domates'],
      description: 'Bayat ekmekleri dilimleyip tavada hafif tereyağında kızartın. Üzerine ezilmiş domates ve kaşarları ekleyip kapağını 3 dakika kapatın.'
    },
    {
      id: 'r2',
      title: 'Kremalı Fırın Makarna & Peynir Graten',
      timeMin: 14,
      savings: 270,
      ingredientsUsed: ['Yarım Sıvı Krema', 'Kaşar Peyniri'],
      description: 'Haşlanmış makarnayı yarım krema ve rendelenmiş kaşarla karıştırıp fırın kabına dökün. Üstü kızarana kadar 10 dakika fırınlayın.'
    },
    {
      id: 'r3',
      title: '10 Dakikalık Pratik Domatesli Şakşuka Omlet',
      timeMin: 8,
      savings: 85,
      ingredientsUsed: ['Domates', 'Yumurta'],
      description: 'Yumuşamış domatesleri tavada zeytinyağı ile hafif ezin, yumurtaları kırıp karıştırın. Taze kekikle servis edin.'
    }
  ];

  const handleAddIngredient = () => {
    if (!newName.trim()) return;
    const days = parseInt(newDays, 10) || 3;
    const val = parseInt(newValue, 10) || 40;
    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: 'Genel',
      daysLeft: days,
      value: val,
      critical: days <= 2
    };
    setIngredients([newItem, ...ingredients]);
    setNewName('');
    setModalVisible(false);
  };

  const handleCookRecipe = (recipe: Recipe) => {
    setLastSavedRecipe(recipe);
    setTotalSavedMonth(prev => prev + recipe.savings);
    setReceiptVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D11" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>KALANLA</Text>
          <Text style={styles.brandTagline}>Ne kaldıysa, ondan başla.</Text>
        </View>
        <View style={styles.systemBadge}>
          <Text style={styles.systemBadgeText}>RYNIA // OS</Text>
        </View>
      </View>

      {/* MUTFAK DEĞERİ & RÖNTGEN BAR */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DOLAP DEĞERİ</Text>
          <Text style={styles.statValue}>₺{totalKitchenValue}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: '#EF4444' }]}>48S RİSKTE</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>₺{totalAtRisk}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: '#10B981' }]}>KURTARILAN</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>₺{totalSavedMonth}</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'see' && styles.tabButtonActive]}
          onPress={() => setActiveTab('see')}
        >
          <Text style={[styles.tabText, activeTab === 'see' && styles.tabTextActive]}>
            GÖR // Kalanlar ({ingredients.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'cook' && styles.tabButtonActive]}
          onPress={() => setActiveTab('cook')}
        >
          <Text style={[styles.tabText, activeTab === 'cook' && styles.tabTextActive]}>
            PİŞİR // Kalanla Yap
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'savings' && styles.tabButtonActive]}
          onPress={() => setActiveTab('savings')}
        >
          <Text style={[styles.tabText, activeTab === 'savings' && styles.tabTextActive]}>
            KAZANCIN
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* TAB 1: GÖR (KALANLAR) */}
        {activeTab === 'see' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>BUZDOLABINDA NE VAR?</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addButtonText}>+ Malzeme Ekle</Text>
              </TouchableOpacity>
            </View>

            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingredientCard}>
                <View style={styles.ingredientLeft}>
                  <View style={[styles.statusDot, item.critical ? styles.dotCritical : styles.dotSafe]} />
                  <View>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientMeta}>
                      {item.daysLeft <= 1 ? '🚨 Son 24 Saat!' : `${item.daysLeft} gün kaldı`} · {item.category}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ingredientValue}>₺{item.value}</Text>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.actionHeroButton}
              onPress={() => setActiveTab('cook')}
            >
              <Text style={styles.actionHeroText}>⚡ Riskteki ₺{totalAtRisk}'yi Kurtar →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: PİŞİR (KALANLA YAP) */}
        {activeTab === 'cook' && (
          <View>
            <Text style={styles.sectionTitle}>10-15 DAKİKALIK KURTARMA MENÜSÜ</Text>
            <Text style={styles.sectionSubtitle}>
              Dolabında çürümek üzere olan malzemelerle anında pişirebileceğin şef yemekleri:
            </Text>

            {recipes.map((recipe) => (
              <View key={recipe.id} style={styles.recipeCard}>
                <View style={styles.recipeBadgeRow}>
                  <Text style={styles.recipeTimeBadge}>⏱ {recipe.timeMin} DAKİKA</Text>
                  <Text style={styles.recipeSavingsBadge}>₺{recipe.savings} CEPTE</Text>
                </View>

                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeDesc}>{recipe.description}</Text>

                <View style={styles.tagsRow}>
                  {recipe.ingredientsUsed.map((ing, idx) => (
                    <View key={idx} style={styles.ingTag}>
                      <Text style={styles.ingTagText}>✓ {ing}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.cookButton}
                  onPress={() => handleCookRecipe(recipe)}
                >
                  <Text style={styles.cookButtonText}>Yemeği Yaptım & Kurtardım 🍳</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: KAZANCIN (TASARRUF) */}
        {activeTab === 'savings' && (
          <View>
            <Text style={styles.sectionTitle}>AYLIK BEREKET & TASARRUF RAPORU</Text>
            
            <View style={styles.savingsHeroCard}>
              <Text style={styles.savingsBigLabel}>BU AY ÇÖPE GİTMEKTEN KURTARILAN</Text>
              <Text style={styles.savingsBigValue}>₺{totalSavedMonth}</Text>
              <Text style={styles.savingsHeroSub}>
                Bu tutarla yaklaşık 3 market alışverişi veya 4 dışarı yemeği bedavaya geldi!
              </Text>
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

      {/* YENİ MALZEME MODALI */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Malzeme Ekle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Örn: 2 Paket Mantar"
              placeholderTextColor="#71717A"
              value={newName}
              onChangeText={setNewName}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
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
                <Text style={[styles.modalBtnText, { color: '#0D0D11', fontWeight: '700' }]}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TERMAL FİŞ PAYLAŞIM MODALI */}
      <Modal visible={receiptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.thermalReceipt}>
            <Text style={styles.thermalHeader}>*** KALANLA KURTARMA FİŞİ ***</Text>
            <Text style={styles.thermalSub}>RYNIA STUDIOS // ZERO WASTE ENGINE</Text>
            <View style={styles.thermalDivider} />
            
            <Text style={styles.thermalItemTitle}>{lastSavedRecipe?.title}</Text>
            <Text style={styles.thermalDetail}>Süre: {lastSavedRecipe?.timeMin} Dk · Dışarı Sipariş Engellendi</Text>
            
            <View style={styles.thermalDivider} />
            <Text style={styles.thermalSavingBig}>KURTARILAN: ₺{lastSavedRecipe?.savings}</Text>
            <Text style={styles.thermalTotal}>AYLIK TOPLAM: ₺{totalSavedMonth}</Text>
            
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
    backgroundColor: '#0D0D11',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F24',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#F5F5F7',
  },
  brandTagline: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  systemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1C1C22',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2C2C35',
  },
  systemBadgeText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#16161C',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24242E',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#2A2A35',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#18181E',
    borderWidth: 1,
    borderColor: '#22222B',
  },
  tabButtonActive: {
    backgroundColor: '#272733',
    borderColor: '#4E4E63',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#A1A1AA',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#272733',
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#16161C',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#22222B',
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCritical: {
    backgroundColor: '#EF4444',
  },
  dotSafe: {
    backgroundColor: '#10B981',
  },
  ingredientName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientMeta: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  ingredientValue: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '700',
  },
  actionHeroButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#10B981',
    borderRadius: 10,
    alignItems: 'center',
  },
  actionHeroText: {
    color: '#0D0D11',
    fontWeight: '800',
    fontSize: 14,
  },
  recipeCard: {
    backgroundColor: '#16161C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#272733',
  },
  recipeBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  recipeTimeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    backgroundColor: '#22222B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recipeSavingsBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  recipeDesc: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  ingTag: {
    backgroundColor: '#202028',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ingTagText: {
    color: '#D4D4D8',
    fontSize: 11,
  },
  cookButton: {
    backgroundColor: '#272733',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F4E',
  },
  cookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  savingsHeroCard: {
    backgroundColor: '#16161C',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#24242E',
    marginTop: 10,
    marginBottom: 16,
  },
  savingsBigLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#A1A1AA',
    marginBottom: 6,
  },
  savingsBigValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 8,
  },
  savingsHeroSub: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: '#16161C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22222B',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 10,
    color: '#71717A',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#18181E',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D2D38',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#101014',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#282832',
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#272733',
  },
  modalBtnSave: {
    backgroundColor: '#FFFFFF',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  thermalReceipt: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  thermalHeader: {
    color: '#18181B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  thermalSub: {
    color: '#71717A',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  thermalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E4E4E7',
    marginVertical: 12,
  },
  thermalItemTitle: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  thermalDetail: {
    color: '#52525B',
    fontSize: 12,
    marginTop: 4,
  },
  thermalSavingBig: {
    color: '#059669',
    fontSize: 20,
    fontWeight: '900',
  },
  thermalTotal: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 2,
  },
  thermalFooter: {
    color: '#71717A',
    fontSize: 11,
    fontStyle: 'italic',
  },
  thermalCloseBtn: {
    marginTop: 16,
    backgroundColor: '#18181B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  thermalCloseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  }
});
