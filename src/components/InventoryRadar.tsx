import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Trash2, AlertTriangle, Sparkles, ChevronRight, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FoodItem } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface InventoryRadarProps {
  items: FoodItem[];
  rescuedTotalTL: number;
  rescuedCo2Kg: number;
  onDeleteItem: (id: string) => void;
  onNavigateToCook: () => void;
  onOpenAddModal: () => void;
}

type FilterType = 'all' | 'urgent' | 'week' | 'fresh';

export const InventoryRadar: React.FC<InventoryRadarProps> = ({
  items,
  rescuedTotalTL,
  onDeleteItem,
  onNavigateToCook,
  onOpenAddModal,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const urgentItems = items.filter((item) => item.hoursLeft <= 48);
  const weekItems = items.filter((item) => item.hoursLeft > 48 && item.hoursLeft <= 168);
  const freshItems = items.filter((item) => item.hoursLeft > 168);

  const filteredItems = items.filter((item) => {
    if (filter === 'urgent') return item.hoursLeft <= 48;
    if (filter === 'week') return item.hoursLeft > 48 && item.hoursLeft <= 168;
    if (filter === 'fresh') return item.hoursLeft > 168;
    return true;
  });

  const totalPantryValue = items.reduce((sum, item) => sum + item.priceTL, 0);
  const riskValue48h = urgentItems.reduce((sum, item) => sum + item.priceTL, 0);

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`"${name}" silinsin mi?`)) {
        onDeleteItem(id);
      }
      return;
    }
    Alert.alert('Malzemeyi Kaldır', `"${name}" dolaptan çıkarılsın mı?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch (e) {}
          onDeleteItem(id);
        },
      },
    ]);
  };

  const getUrgentBadge = (hours: number) => {
    if (hours <= 24) {
      return (
        <View style={styles.badgeCritical}>
          <Text style={styles.badgeCriticalText}>🚨 SON {hours} SAAT</Text>
        </View>
      );
    }
    if (hours <= 48) {
      return (
        <View style={styles.badgeCritical}>
          <Text style={styles.badgeCriticalText}>⚡ {hours} SAAT KALDI</Text>
        </View>
      );
    }
    const days = Math.round(hours / 24);
    return (
      <View style={styles.badgeWarning}>
        <Text style={styles.badgeWarningText}>{days} GÜN KALDI</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. THREE-PILLAR TELEMETRY RADAR */}
      <View style={styles.radarCard}>
        <View style={styles.radarCol}>
          <Text style={styles.radarLabel}>DOLAP DEĞERİ</Text>
          <Text style={styles.radarValue}>₺{totalPantryValue}</Text>
          <Text style={styles.radarSub}>{items.length} Kalem Gıda</Text>
        </View>

        <View style={styles.radarDivider} />

        <View style={styles.radarCol}>
          <Text style={[styles.radarLabel, { color: '#EF4444' }]}>48S RİSKTE</Text>
          <Text style={[styles.radarValue, { color: '#EF4444' }]}>₺{riskValue48h}</Text>
          <Text style={[styles.radarSub, { color: '#EF4444' }]}>
            {urgentItems.length} Ürün Acil
          </Text>
        </View>

        <View style={styles.radarDivider} />

        <View style={styles.radarCol}>
          <Text style={[styles.radarLabel, { color: '#10B981' }]}>KURTARILAN</Text>
          <Text style={[styles.radarValue, { color: '#10B981' }]}>₺{rescuedTotalTL}</Text>
          <Text style={[styles.radarSub, { color: '#10B981' }]}>Cepte Kaldı</Text>
        </View>
      </View>

      {/* 2. URGENT RESCUE HERO BANNER */}
      {urgentItems.length > 0 ? (
        <TouchableOpacity
          style={styles.heroActionBanner}
          onPress={onNavigateToCook}
          activeOpacity={0.85}
        >
          <View style={styles.heroLeft}>
            <View style={styles.heroAlertPill}>
              <AlertTriangle size={14} color="#EF4444" />
              <Text style={styles.heroAlertText}>ACİL KURTARMA</Text>
            </View>
            <Text style={styles.heroTitle}>
              {urgentItems.length} Malzemenin Son Saatleri
            </Text>
            <Text style={styles.heroSubtitle}>
              ₺{riskValue48h} değerindeki gıdayı 10-15 dakikada lezzete dönüştür
            </Text>
          </View>
          <View style={styles.heroArrowBtn}>
            <ChevronRight size={18} color="#0A0A0E" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.safeBanner}>
          <Text style={styles.safeBannerText}>
            ✓ Şu an 48 saatlik acil risk yok. Dolabın dengede!
          </Text>
        </View>
      )}

      {/* 3. FILTER PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            TÜMÜ ({items.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'urgent' && styles.filterPillActiveUrgent]}
          onPress={() => setFilter('urgent')}
        >
          <Text
            style={[styles.filterText, filter === 'urgent' && styles.filterTextActiveUrgent]}
          >
            🚨 48S RİSK ({urgentItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'week' && styles.filterPillActive]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>
            BU HAFTA ({weekItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'fresh' && styles.filterPillActive]}
          onPress={() => setFilter('fresh')}
        >
          <Text style={[styles.filterText, filter === 'fresh' && styles.filterTextActive]}>
            TAZE ({freshItems.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 4. FOOD ITEM LIST OR EMPTY STATE */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🥬</Text>
          <Text style={styles.emptyTitle}>Bu filtrede gıda bulunamadı</Text>
          <Text style={styles.emptySubtitle}>
            Yeni malzeme ekleyerek mutfak radarını zenginleştir.
          </Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={onOpenAddModal}>
            <Text style={styles.emptyAddBtnText}>+ Malzeme Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filteredItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {/* Thumbnail */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage]}>
                <Text style={{ fontSize: 20 }}>🍴</Text>
              </View>
            )}

            {/* Content */}
            <View style={styles.itemContent}>
              <View style={styles.itemTopRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>₺{item.priceTL}</Text>
              </View>

              <View style={styles.itemMetaRow}>
                <Text style={styles.itemMeta}>
                  {item.amount} · {item.location}
                </Text>
              </View>

              <View style={styles.itemBottomRow}>
                {getUrgentBadge(item.hoursLeft)}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <Trash2 size={15} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 20,
  },
  radarCard: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.md,
  },
  radarCol: {
    flex: 1,
    alignItems: 'center',
  },
  radarLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  radarValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  radarSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  radarDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#262633',
  },
  heroActionBanner: {
    backgroundColor: '#1A1519',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroAlertText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  heroArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: spacing.md,
  },
  safeBannerText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterContent: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#14141A',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#262633',
  },
  filterPillActive: {
    backgroundColor: '#1C1C26',
    borderColor: '#10B981',
  },
  filterPillActiveUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  filterTextActive: {
    color: '#10B981',
  },
  filterTextActiveUrgent: {
    color: '#EF4444',
  },
  itemCard: {
    backgroundColor: '#14141A',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#1F1F28',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    marginRight: spacing.md,
    backgroundColor: '#1C1C24',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    paddingRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  itemMetaRow: {
    marginBottom: 6,
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgeCriticalText: {
    color: '#EF4444',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  badgeWarning: {
    backgroundColor: '#1C1C24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262633',
  },
  badgeWarningText: {
    color: '#94A3B8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyBox: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginTop: spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  emptyAddBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  emptyAddBtnText: {
    color: '#0A0A0E',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
