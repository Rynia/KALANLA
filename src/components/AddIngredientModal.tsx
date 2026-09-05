import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ingredient, IngredientCategory, CatalogIngredient } from '../types/models';
import { commonIngredientsCatalog } from '../data/initialData';
import { colors, spacing, radius } from '../theme/theme';

interface AddIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onAddIngredient: (ingredient: Ingredient) => void;
}

const CATEGORIES: IngredientCategory[] = [
  'Süt Ürünleri',
  'Sebze',
  'Fırın',
  'Et & Şarküteri',
  'Temel Gıda',
  'Meyve',
  'Genel',
];

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  visible,
  onClose,
  onAddIngredient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('Genel');
  const [days, setDays] = useState('3');
  const [value, setValue] = useState('40');

  // Search suggestions from Turkish pantry catalog
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return commonIngredientsCatalog.slice(0, 6);
    }
    const query = searchQuery.toLocaleLowerCase('tr-TR').trim();
    return commonIngredientsCatalog
      .filter((item) =>
        item.name.toLocaleLowerCase('tr-TR').includes(query) ||
        item.category.toLocaleLowerCase('tr-TR').includes(query)
      )
      .slice(0, 8);
  }, [searchQuery]);

  const handleSelectSuggestion = (item: CatalogIngredient) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    setName(item.name);
    setCategory(item.category);
    setDays(item.defaultDays.toString());
    setValue(item.defaultValue.toString());
  };

  const handleQuickAdd = (item: CatalogIngredient) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
    const newIngredient: Ingredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      category: item.category,
      daysLeft: item.defaultDays,
      value: item.defaultValue,
      critical: item.defaultDays <= 2,
      unit: item.unit,
    };
    onAddIngredient(newIngredient);
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const finalName = name.trim() || searchQuery.trim();
    if (!finalName) {
      Alert.alert('Eksik Bilgi', 'Lütfen malzeme adını girin.');
      return;
    }

    const numDays = parseInt(days, 10) || 3;
    const numValue = parseInt(value, 10) || 40;

    const newIngredient: Ingredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: finalName,
      category,
      daysLeft: numDays,
      value: numValue,
      critical: numDays <= 2,
    };

    onAddIngredient(newIngredient);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSearchQuery('');
    setName('');
    setCategory('Genel');
    setDays('3');
    setValue('40');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeaderRow}>
            <View>
              <Text style={styles.modalTitle}>Dolaba Malzeme Ekle</Text>
              <Text style={styles.modalSub}>Türk mutfağından hızlı ara veya yaz</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Search Input */}
            <Text style={styles.inputLabel}>MALZEME ARA VEYA YAZ</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Örn: Kaşar, Domates, Maydanoz, Kıyma..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setName(text);
              }}
              autoFocus
            />

            {/* Quick Suggestions / Autocomplete */}
            <Text style={styles.sectionMiniLabel}>
              {searchQuery.trim() ? 'EŞLEŞEN MALZEMELER' : 'SIK KULLANILANLAR (HIZLI SEÇ)'}
            </Text>

            <View style={styles.suggestionsContainer}>
              {suggestions.map((item, idx) => (
                <View key={idx} style={styles.suggestionRow}>
                  <TouchableOpacity
                    style={styles.suggestionLeft}
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionMeta}>
                      {item.category} · ~{item.defaultDays} gün · ~₺{item.defaultValue}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickAddChip}
                    onPress={() => handleQuickAdd(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickAddChipText}>+ Hızlı Ekle</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Category Selector */}
            <Text style={[styles.inputLabel, { marginTop: spacing.md }]}>KATEGORİ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Days Left & Value Inputs */}
            <View style={styles.inputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>KAÇ GÜN KALDI?</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={days}
                  onChangeText={setDays}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>TAHMİNİ DEĞER (₺)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={setValue}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={onClose}>
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleSubmit}>
                <Text style={styles.modalBtnSaveText}>Dolaba Kaydet ✓</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionMiniLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.titanium,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  suggestionsContainer: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    maxHeight: 220,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  suggestionLeft: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  suggestionMeta: {
    fontSize: 11,
    color: colors.muted,
  },
  quickAddChip: {
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.emerald,
  },
  quickAddChipText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryScroll: {
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
  inputsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
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
  modalButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnCancelText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 14,
  },
  modalBtnSave: {
    backgroundColor: colors.emerald,
  },
  modalBtnSaveText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 14,
  },
});
