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
import { X, Plus, Minus, Camera, Receipt, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FoodItem, FoodCategory, StorageLocation } from '../types/models';
import { TURKISH_STAPLES, TurkishStapleSuggestion } from '../data/initialData';
import { colors, spacing, radius } from '../theme/theme';
import { resolveFoodImage } from '../utils/foodImageResolver';
import { findTypoSuggestion } from '../utils/fuzzyMatch';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<FoodItem, 'id' | 'addedAt'>) => void;
  onOpenVisionScan?: () => void;
  onOpenReceiptScan?: () => void;
}

const CATEGORIES: FoodCategory[] = [
  'Süt Ürünü',
  'Unlu Mamul',
  'Sebze',
  'Şarküteri',
  'Et & Tavuk',
  'Meyve',
  'Kiler',
];

const LOCATIONS: StorageLocation[] = ['Buzdolabı', 'Dondurucu', 'Kiler'];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  onOpenVisionScan,
  onOpenReceiptScan,
}) => {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Sebze');
  const [location, setLocation] = useState<StorageLocation>('Buzdolabı');
  const [amountVal, setAmountVal] = useState<number>(250);
  const [unit, setUnit] = useState<string>('g');
  const [days, setDays] = useState<number>(3);
  const [priceTL, setPriceTL] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState<string>('');

  const filteredStaples = useMemo(() => {
    if (!search.trim()) return TURKISH_STAPLES;
    const lower = search.toLocaleLowerCase('tr-TR');
    return TURKISH_STAPLES.filter((s) =>
      s.name.toLocaleLowerCase('tr-TR').includes(lower),
    );
  }, [search]);

  // "Şunu mu demek istediniz?" fuzzy typo önerisi
  const typoSuggestion = useMemo(() => {
    if (!search.trim() || filteredStaples.length > 0) return null;
    return findTypoSuggestion(search);
  }, [search, filteredStaples]);

  const handleSelectStaple = (staple: TurkishStapleSuggestion) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    setName(staple.name);
    setCategory(staple.category);
    setLocation(staple.location);
    setAmountVal(staple.defaultAmount);
    setUnit(staple.unit);
    setDays(staple.defaultDays);
    setPriceTL(staple.defaultPrice);
  };

  const handleSubmit = () => {
    const finalName = name.trim() || search.trim();
    if (!finalName) {
      Alert.alert('Eksik Bilgi', 'Lütfen malzeme adı girin.');
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }

    const hours = days * 24;
    const risk = hours <= 24 ? 92 : hours <= 48 ? 80 : hours <= 72 ? 65 : 30;

    onAddItem({
      name: finalName,
      category,
      amount: `${amountVal}${unit}`,
      location,
      hoursLeft: hours,
      riskPercentage: risk,
      priceTL,
      imageUrl: imageUrl || resolveFoodImage(finalName, category),
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSearch('');
    setName('');
    setCategory('Sebze');
    setLocation('Buzdolabı');
    setAmountVal(250);
    setUnit('g');
    setDays(3);
    setPriceTL(50);
    setImageUrl('');
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheetContainer}>
          {/* Drag handle */}
          <View style={styles.handlePill} />

          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Dolaba Malzeme Ekle</Text>
              <Text style={styles.headerSub}>Türk mutfağından hızlı ara veya kamerayla tara</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {onOpenReceiptScan && (
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: '#3B82F6' }]}
                  onPress={() => {
                    onClose();
                    onOpenReceiptScan();
                  }}
                >
                  <Receipt size={16} color="#60A5FA" />
                </TouchableOpacity>
              )}
              {onOpenVisionScan && (
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981' }]}
                  onPress={() => {
                    onClose();
                    onOpenVisionScan();
                  }}
                >
                  <Camera size={16} color="#10B981" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Malzeme ara (Örn: Kaşar, Domates, Kıyma)..."
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setName(text);
              }}
              autoFocus
            />

            {/* "Şunu mu demek istediniz?" Akıllı Yazım Düzeltici */}
            {typoSuggestion && (
              <TouchableOpacity
                style={styles.suggestionBanner}
                onPress={() => {
                  handleSelectStaple(typoSuggestion);
                  setSearch(typoSuggestion.name);
                }}
                activeOpacity={0.8}
              >
                <Sparkles size={14} color="#10B981" />
                <Text style={styles.suggestionText}>
                  Şunu mu demek istediniz:{' '}
                  <Text style={styles.suggestionHighlight}>
                    {typoSuggestion.icon} {typoSuggestion.name}
                  </Text>{' '}
                  [✓ Onayla]
                </Text>
              </TouchableOpacity>
            )}

            {/* Quick Staples Carousel */}
            <Text style={styles.sectionLabel}>SIK KULLANILAN GIDALAR</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.staplesScroll}
              contentContainerStyle={styles.staplesContent}
            >
              {filteredStaples.slice(0, 10).map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.stapleChip}
                  onPress={() => handleSelectStaple(s)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stapleIcon}>{s.icon}</Text>
                  <Text style={styles.stapleName}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Storage Location Selector */}
            <Text style={styles.sectionLabel}>SAKLAMA ALANI</Text>
            <View style={styles.pillRow}>
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.selectorPill, location === loc && styles.selectorPillActive]}
                  onPress={() => setLocation(loc)}
                >
                  <Text
                    style={[
                      styles.selectorPillText,
                      location === loc && styles.selectorPillTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Days & Price Steppers */}
            <View style={styles.steppersRow}>
              {/* Days Stepper */}
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>TAHMİNİ ÖMÜR</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setDays(Math.max(1, days - 1))}
                  >
                    <Minus size={14} color="#F8FAFC" />
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{days} Gün</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setDays(days + 1)}
                  >
                    <Plus size={14} color="#F8FAFC" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price Stepper */}
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>TAHMİNİ DEĞER</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPriceTL(Math.max(5, priceTL - 10))}
                  >
                    <Minus size={14} color="#F8FAFC" />
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>₺{priceTL}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPriceTL(priceTL + 10)}
                  >
                    <Plus size={14} color="#F8FAFC" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Dolaba Ekle ✓</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#14141A',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#262633',
  },
  handlePill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#0A0A0E',
    color: '#F8FAFC',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#262633',
    marginBottom: spacing.sm,
  },
  suggestionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: spacing.md,
  },
  suggestionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  suggestionHighlight: {
    color: '#10B981',
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  staplesScroll: {
    marginBottom: spacing.md,
  },
  staplesContent: {
    gap: 8,
  },
  stapleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1C24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#262633',
  },
  stapleIcon: {
    fontSize: 16,
  },
  stapleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  selectorPill: {
    flex: 1,
    backgroundColor: '#1C1C24',
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262633',
  },
  selectorPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  selectorPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  selectorPillTextActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  steppersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.xl,
  },
  stepperBox: {
    flex: 1,
    backgroundColor: '#0A0A0E',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#262633',
  },
  stepperLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'monospace',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepperControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  submitBtnText: {
    color: '#0A0A0E',
    fontWeight: '900',
    fontSize: 15,
    fontFamily: 'monospace',
  },
});
