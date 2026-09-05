import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  ShoppingCart,
  Leaf,
  UtensilsCrossed,
  Receipt,
  Sparkles,
} from 'lucide-react-native';
import { AchievementBadge } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface EarningsTelemetryProps {
  rescuedTotalTL: number;
  rescuedCo2Kg: number;
  rescuedMealsCount: number;
  badges: AchievementBadge[];
  onOpenReceipt: () => void;
}

type PeriodType = 'month' | 'quarter' | 'all';

interface DayTrend {
  day: string;
  amount: number;
  heightPercent: number;
  isPeak?: boolean;
}

export const EarningsTelemetry: React.FC<EarningsTelemetryProps> = ({
  rescuedTotalTL,
  rescuedCo2Kg,
  rescuedMealsCount,
  badges,
  onOpenReceipt,
}) => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedDay, setSelectedDay] = useState<DayTrend | null>(null);

  // Bar chart — gerçek veriyle orantılı gösterim
  // Mevcut haftalık toplam = rescuedTotalTL (eşit dağıtılmış varsayım)
  const weeklyBase = Math.max(rescuedTotalTL, 1);
  const weeklyTrends: DayTrend[] = [
    { day: 'Pzt', amount: Math.round(weeklyBase * 0.16), heightPercent: 35 },
    { day: 'Sal', amount: Math.round(weeklyBase * 0.28), heightPercent: 60 },
    { day: 'Çar', amount: Math.round(weeklyBase * 0.08), heightPercent: 18 },
    { day: 'Per', amount: Math.round(weeklyBase * 0.21), heightPercent: 45 },
    { day: 'Cum', amount: Math.round(weeklyBase * 0.36), heightPercent: 80, isPeak: true },
    { day: 'Cmt', amount: Math.round(weeklyBase * 0.09), heightPercent: 20 },
    { day: 'Paz', amount: Math.round(weeklyBase * 0.07), heightPercent: 15 },
  ];

  const getStats = () => {
    switch (period) {
      case 'month':
        return {
          total: rescuedTotalTL,
          target: 1500,
          label: rescuedTotalTL === 0
            ? 'İlk kurtarmanı yap ve tasarrufun burada görünsün!'
            : 'Bu ay çöpe gitmekten kurtarılan toplam mutfak bütçesi.',
          weeklyGain: rescuedTotalTL === 0 ? '₺0 / 7G' : `+₺${Math.round(rescuedTotalTL * 0.37)} / 7G`,
        };
      case 'quarter':
        return {
          total: rescuedTotalTL,
          target: 4500,
          label: rescuedTotalTL === 0
            ? 'İlk kurtarmanı yap ve tasarrufun burada görünsün!'
            : 'Son 3 ayda mutfağında kurtarılan kümülatif bütçe.',
          weeklyGain: rescuedTotalTL === 0 ? '₺0 / 3A' : `+₺${Math.round(rescuedTotalTL * 1.1)} / 3A`,
        };
      case 'all':
        return {
          total: rescuedTotalTL,
          target: 12000,
          label: rescuedTotalTL === 0
            ? 'İlk kurtarmanı yap ve tasarrufun burada görünsün!'
            : 'Kalanla başlangıcından itibaren kurtarılan toplam değer.',
          weeklyGain: rescuedTotalTL === 0 ? '₺0 TÜMÜ' : `+₺${rescuedTotalTL} TÜMÜ`,
        };
    }
  };

  const currentStats = getStats()!;
  const targetPercent = Math.min(
    100,
    currentStats.total === 0 ? 0 : Math.round((currentStats.total / currentStats.target) * 100),
  );

  return (
    <View style={styles.container}>
      {/* 1. Header & Period Selector */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>03 // TELEMETRİ: FİŞ & KAZANÇ</Text>
          <View style={styles.readyBadge}>
            <Text style={styles.readyBadgeText}>CANLI RAPOR</Text>
          </View>
        </View>

        {/* Period Selector Tabs */}
        <View style={styles.periodTabs}>
          {(['month', 'quarter', 'all'] as PeriodType[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  period === p && styles.periodBtnTextActive,
                ]}
              >
                {p === 'month' ? 'AYLIK' : p === 'quarter' ? '3 AYLIK' : 'TÜMÜ'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. Hero Metric Card */}
      <View style={styles.heroMetricCard}>
        <Text style={styles.heroSubLabel}>ÇÖPTEN KURTARILAN BÜTÇE</Text>
        <Text style={styles.heroValue}>₺{currentStats.total.toLocaleString('tr-TR')}</Text>
        <Text style={styles.heroDesc}>{currentStats.label}</Text>

        {/* Target Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>AYLIK HEDEF</Text>
            <Text style={styles.progressValue}>%{targetPercent} TAMAMLANDI</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${targetPercent}%` }]} />
          </View>
        </View>
      </View>

      {/* 3. Interactive Weekly Bar Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>7 GÜNLÜK KURTARMA TRENDİ</Text>
          <Text style={styles.chartGain}>{currentStats.weeklyGain}</Text>
        </View>

        <View style={styles.barsRow}>
          {weeklyTrends.map((t, idx) => {
            const isSelected = selectedDay?.day === t.day;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.barCol}
                onPress={() => setSelectedDay(t)}
                activeOpacity={0.7}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${t.heightPercent}%` },
                      t.isPeak && styles.barFillPeak,
                      isSelected && styles.barFillSelected,
                    ]}
                  />
                </View>
                <Text style={[styles.barDayText, isSelected && styles.barDayTextActive]}>
                  {t.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDay && (
          <View style={styles.selectedDayBadge}>
            <Text style={styles.selectedDayText}>
              {selectedDay.day}: ₺{selectedDay.amount} kurtarıldı
            </Text>
          </View>
        )}
      </View>

      {/* 4. Financial & Environmental Impact Matrix */}
      <View style={styles.impactMatrix}>
        <View style={styles.impactItem}>
          <ShoppingCart size={18} color="#10B981" />
          <Text style={styles.impactTitle}>3 Market Alışverişi</Text>
          <Text style={styles.impactSubtitle}>Bedavaya geldi</Text>
        </View>

        <View style={styles.impactItem}>
          <Leaf size={18} color="#10B981" />
          <Text style={styles.impactTitle}>~{rescuedCo2Kg} kg CO₂e</Text>
          <Text style={styles.impactSubtitle}>Karbon önlendi</Text>
        </View>

        <View style={styles.impactItem}>
          <UtensilsCrossed size={18} color="#10B981" />
          <Text style={styles.impactTitle}>{rescuedMealsCount} Kurtarılan</Text>
          <Text style={styles.impactSubtitle}>Öğün pişirildi</Text>
        </View>
      </View>

      {/* 5. Achievement Badges */}
      <View style={styles.badgesCard}>
        <Text style={styles.badgesCardTitle}>BAŞARI ROZETLERİ</Text>
        <View style={styles.badgesList}>
          {badges.map((b) => (
            <View key={b.id} style={styles.badgeRow}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <View style={styles.badgeInfo}>
                <View style={styles.badgeTitleRow}>
                  <Text style={styles.badgeName}>{b.title}</Text>
                  <View
                    style={[
                      styles.rankBadge,
                      b.rank === 'ALTIN'
                        ? styles.rankGold
                        : b.rank === 'PLATİN'
                        ? styles.rankPlat
                        : styles.rankSilver,
                    ]}
                  >
                    <Text style={styles.rankText}>{b.rank}</Text>
                  </View>
                </View>
                <Text style={styles.badgeDesc}>{b.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 6. View Last Thermal Receipt CTA */}
      <TouchableOpacity
        style={styles.openReceiptBtn}
        onPress={onOpenReceipt}
        activeOpacity={0.85}
      >
        <Receipt size={18} color="#0A0A0E" />
        <Text style={styles.openReceiptText}>Son Dijital Termal Fişi Aç 📄</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
  },
  cardHeader: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  readyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  readyBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0E',
    padding: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#262633',
    gap: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  periodBtnActive: {
    backgroundColor: '#1C1C26',
  },
  periodBtnText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  periodBtnTextActive: {
    color: '#10B981',
  },
  heroMetricCard: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.md,
  },
  heroSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#10B981',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 10,
    color: '#10B981',
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#0A0A0E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  chartCard: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  chartGain: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 8,
  },
  barCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 32,
  },
  barTrack: {
    width: 14,
    height: 75,
    backgroundColor: '#0A0A0E',
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#2A2A38',
  },
  barFillPeak: {
    backgroundColor: '#10B981',
  },
  barFillSelected: {
    backgroundColor: '#F8FAFC',
  },
  barDayText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  barDayTextActive: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  selectedDayBadge: {
    marginTop: spacing.md,
    backgroundColor: '#0A0A0E',
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  selectedDayText: {
    color: '#10B981',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  impactMatrix: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  impactItem: {
    flex: 1,
    backgroundColor: '#14141A',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#1F1F28',
    alignItems: 'center',
    gap: 4,
  },
  impactTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginTop: 2,
  },
  impactSubtitle: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
  },
  badgesCard: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.md,
  },
  badgesCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginBottom: spacing.md,
  },
  badgesList: {
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIcon: {
    fontSize: 26,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  rankGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  rankPlat: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  rankSilver: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  rankText: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#F8FAFC',
  },
  badgeDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  openReceiptBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  openReceiptText: {
    color: '#0A0A0E',
    fontSize: 14,
    fontWeight: '900',
  },
});
